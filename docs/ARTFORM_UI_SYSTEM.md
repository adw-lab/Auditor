# Artform UI system — D20 Digital Automation kit

**Share this file.** It is the one setup for every Artform GitHub repo so Cursor agents produce the same clean, Apple-like UI Base44 gets from a design system — without Base44.

Canonical copy lives in `Artform-Labs/tessa-af`. If a local copy disagrees with this file on `main`, this file wins.

## The one idea

Cursor is an unconstrained IDE. Asked to "make a dashboard," it will invent CSS file-by-file. Base44 looks polished because it **does not invent CSS** — it configures shadcn/Tailwind. Artform already has that kit in Tessa (`components.json` style **new-york**, Inter + Syne, teal `--primary`). This system makes that kit **mandatory and portable**.

Tessa itself still **publishes through Base44** until the employee database and Google connectors move (see `docs/adr/0006-base44-function-cap-and-ui-only.md`). New D20 tools do not need Base44 at all: Next.js or Vite + this kit + Vercel.

## Commands — new internal tool (copy/paste)

**Preferred:** GitHub → `Artform-Labs/artform-app` → **Use this template**. That repo is a Next.js app with the palette, shadcn, Cursor rule, and a sample page already wired. Open the new repo in Cursor and paste `CURSOR_PROMPT.md`.

Until Josh has published that template (Settings → Template repository on `artform-app`), seed from this clone:

```bash
# 1. App shell (Next.js App Router is the default for new D20 tools)
npx create-next-app@latest "$APP_NAME" --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd "$APP_NAME"
git init   # if create-next-app did not

# 2. Design system (non-interactive — never use the TTY wizard in an agent)
npx shadcn@latest init -d --base radix
npx shadcn@latest add button card input label textarea select tabs table dialog \
  dropdown-menu sheet sonner skeleton separator badge avatar alert tooltip

# 3. Artform constraints (from a clone of tessa-af, any branch that has this kit)
bash /path/to/tessa-af/scripts/bootstrap-artform-ui.sh .

# 4. Prove the kit is present
node scripts/check-artform-ui.mjs   # or: npm run ui:check once package.json has the script
```

Then open Cursor on that repo and paste **one** first prompt (also in `templates/artform-ui/CURSOR_PROMPT.md`):

> Follow `.cursor/rules/artform-ui.mdc` and `docs/ARTFORM_UI_SYSTEM.md` if present.
> Build the UI with shadcn/ui only. Tailwind tokens only (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`). Inter body, Syne headings with `tracking-tight`. Cards are `rounded-xl border shadow-sm`. One primary action per screen. Mobile-first. Do not invent hex colors, new fonts, or custom CSS files.

## Commands — existing repo (including Tessa)

```bash
# From tessa-af itself, after pulling main:
npm run ui:check

# From any other clone, inject the kit without touching business code:
bash /path/to/tessa-af/scripts/bootstrap-artform-ui.sh /path/to/other-repo
```

Bootstrap copies `.cursor/rules/artform-ui.mdc`, token CSS, layout primitives, the checker, and a prompt card. It will not overwrite existing files unless you pass `--force`.

## Workflow (replaces "ask Base44 to draw the page")

1. **Brief** — one paragraph: who the user is, the decision the screen supports, empty/error cases.
2. **Architect** — Claude Code plans data, APIs, and milestones (`npm run review:claude` at the gate).
3. **Shell** — either prompt Cursor against this kit, **or** generate a visual in [v0.dev](https://v0.dev) and paste it in with: *restyle onto Artform tokens before wiring data*.
4. **Agent** — Cursor implements against shadcn + tokens, verifies in the browser, opens a draft PR.
5. **Review** — Claude Code at the milestone; a human merges. Nobody publishes from the agent.

## Aesthetic bar (what "gorgeous" means here)

| Do | Don't |
| --- | --- |
| Neutral canvas, one teal accent, lots of air | Rainbow KPI tiles, neon glow on tables |
| shadcn Card / Button / Table / Dialog | Hand-rolled `<div>` buttons and custom hex |
| One H1 that names the decision | A wall of equal-weight numbers |
| Skeleton → content or EmptyState | A blank white box while loading |
| 40px tap targets, stacks on mobile | Hover-only actions, tiny icon buttons |

Magic UI / Aceternity are **not** the default. They fight an Apple-like ops tool. Use them only when the brief is a public marketing landing page, and still map colors to Artform tokens.

## What every Artform GitHub repo must contain

| File | Role |
| --- | --- |
| `.cursor/rules/artform-ui.mdc` | Agents actually obey this. `alwaysApply: true`. |
| `AGENTS.md` | One paragraph pointing at the UI rule (bootstrap appends a snippet if you ask). |
| `components.json` | shadcn config (style `new-york`, `cssVariables: true`). |
| Semantic CSS variables | `--background`, `--foreground`, `--primary`, `--radius`, etc. |
| `scripts/check-artform-ui.mjs` | Fails CI/local if the rule file is missing or gutted. |

GitHub cannot push Cursor rules into repos you have not cloned. **Org consistency = GitHub template (`Artform-Labs/artform-app`) + bootstrap + this checker.** After the template repo exists, D20 starts there. Optional: Cursor Team Rules as a backup, never as the source of truth.

## Honest boundary with Base44

- **Static / no-data tools** (a style preview, a public brochure with no Artform APIs) may skip Base44 hosting and sit on Vercel with this kit.
- **Anything that reads Artform data, Sidekick, Procore, or Smartsheet** still needs a **server-side auth gate**. This kit does not invent that gate. Tessa already has Base44 auth; Sidekick already has `x-sidekick-api-key`. A new data-touching app needs its own ADR before it "skips Base44."
- **Tessa employee app** — keep shipping UI in `src/` with this kit; Josh still clicks Publish in Base44. The lock-in is the **database and Google OAuth**, not the CSS.
- Do not run `shadcn init` inside Tessa. The components already live in `src/components/ui/`. New screens compose `PageNav` + `@/components/artform`.

## Updating the kit in other repos

The Cursor rule frontmatter has `version:` (currently `1.0.0`). `npm run ui:check` prints it. To pull a newer kit, re-run bootstrap with `--force` from an up-to-date `tessa-af` `main`. There is no automatic fan-out; each repo is a copy.

## Visual reference

Open `templates/artform-ui/preview.html` in a browser, or after Tessa is published, `/artform-ui-kit`
(unlisted). That is the look: type, cards, metrics, empty state, buttons. Agents should match it,
not a random Dribbble shot.
