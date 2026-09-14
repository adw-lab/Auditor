#!/usr/bin/env node
/**
 * check-artform-ui — the Artform UI kit is present and the Cursor rule is intact.
 *
 * Run: npm run ui:check
 *
 * This is a presence check (rule file + required phrases +, on tessa-af, kit files).
 * It does not prove a new page used tokens. Visual bar: templates/artform-ui/preview.html.
 *
 * Canonical vs portable: templates/artform-ui/CANONICAL exists only in tessa-af.
 * Bootstrap must not copy that marker.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const fail = (m) => errors.push(m);
const abs = (p) => path.join(ROOT, p);
const read = (p) => readFileSync(abs(p), 'utf8');

const RULE = '.cursor/rules/artform-ui.mdc';
let version = 'unknown';
if (!existsSync(abs(RULE))) {
  fail(`${RULE} is missing — from a tessa-af clone run: bash scripts/bootstrap-artform-ui.sh /path/to/this-repo`);
} else {
  const text = read(RULE);
  const ver = text.match(/^version:\s*(\S+)/m);
  if (!ver) fail(`${RULE} is missing a version: stamp in the frontmatter`);
  else version = ver[1];

  // Anchors are structural — frontmatter keys, section headings, token and component
  // names — never prose. Rewording a sentence must not fail CI; deleting a constraint must.
  const anchors = [
    ['frontmatter', /^alwaysApply:\s*true\s*$/m],
    ['a Stack section', /^##\s+Stack\b/m],
    ['a Layout section', /^##\s+Layout\b/m],
    ['an Auth section', /^##\s+Auth\b/m],
    ['the shadcn/ui requirement', /shadcn\/ui/],
    ['the lucide icon requirement', /lucide-react/],
    ['semantic color tokens', /bg-background/],
    ['semantic text tokens', /text-(foreground|muted-foreground)/],
    ['semantic border tokens', /border-border/],
    ['the Artform heading font', /font-syne/],
    ['the layout primitives', /PageShell/],
    ['the animation-library carve-out', /Magic UI|Aceternity/],
    ['the credential rule', /SIDEKICK_API_SECRET/],
  ];
  for (const [what, pattern] of anchors) {
    if (!pattern.test(text)) {
      fail(`${RULE} no longer states ${what} (looked for ${pattern})`);
    }
  }
}

const isCanonical = existsSync(abs('templates/artform-ui/CANONICAL'));
if (isCanonical) {
  const extra = [
    'docs/ARTFORM_UI_SYSTEM.md',
    'docs/adr/0009-artform-ui-system.md',
    'templates/artform-ui/CURSOR_PROMPT.md',
    'templates/artform-ui/preview.html',
    'templates/artform-ui/styles/tokens.css',
    'src/components/artform/PageShell.jsx',
    'src/components/artform/PageHeader.jsx',
    'src/components/artform/MetricCard.jsx',
    'src/components/artform/EmptyState.jsx',
    'src/components/artform/index.js',
    'scripts/bootstrap-artform-ui.sh',
    'src/pages/ArtformUiKit.jsx',
  ];
  for (const p of extra) {
    if (!existsSync(abs(p))) fail(`canonical kit file missing: ${p}`);
  }
}

if (errors.length) {
  console.error('Artform UI check failed:\n');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log('Artform UI check ok');
console.log(`  rule: ${RULE}  version ${version}`);
if (isCanonical) console.log('  kit:  canonical (playbook + primitives + preview)');
else console.log('  kit:  portable (Cursor rule present)');
