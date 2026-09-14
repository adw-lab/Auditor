# Artform app

GitHub **template** for new D20 internal tools. Click **Use this template** → new repo. Cursor agents already have the Artform look: shadcn/ui, shared CSS variables, Inter + Syne, one primary action.

Apps may differ in layout and features. They **share the palette** (`--primary` teal, `--background`, `--radius`, type). Do not invent hex colors.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run ui:check # Cursor rule still intact
npm run build
```

First Cursor prompt: paste `CURSOR_PROMPT.md`.

Playbook: `docs/ARTFORM_UI_SYSTEM.md`.

## Auth

This seed is a static shell. If you wire Sidekick, Procore, or Smartsheet, add a **server-side** auth gate. The browser never holds `SIDEKICK_API_SECRET`.

## How this repo became a GitHub template

Published 2026-08-29 as the private org template `Artform-Labs/artform-app` (Settings → General → **Template repository** is checked). Cloud-agent `gh` on `tessa-af` cannot see this repo; that 404 is not "unpublished."
