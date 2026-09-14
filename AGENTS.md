# Artform app

New D20 internal tool, seeded from `Artform-Labs/artform-app`.

```bash
npm install
npm run dev
npm run ui:check
```

## UI work

Follow `.cursor/rules/artform-ui.mdc`. Playbook: `docs/ARTFORM_UI_SYSTEM.md`. First prompt: `CURSOR_PROMPT.md`.

- shadcn/ui + Tailwind semantic tokens only. Never invent hex colors.
- Inter body, Syne headings (`font-syne tracking-tight`). Cards: `rounded-xl border shadow-sm`.
- Compose `PageShell` / `PageHeader` / `MetricCard` / `EmptyState` from `@/components/artform`.

If this tool will read Artform data, put a server-side auth gate in place before it ships. The browser never holds `SIDEKICK_API_SECRET`.
