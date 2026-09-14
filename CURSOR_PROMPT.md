# First prompt — paste this when an agent should build or restyle UI

Follow `.cursor/rules/artform-ui.mdc`. If this repo has `docs/ARTFORM_UI_SYSTEM.md`, that is the playbook.

Build (or restyle) the UI with **shadcn/ui** only. Styling is **Tailwind semantic tokens only**:
`bg-background`, `text-foreground`, `bg-card`, `text-card-foreground`, `border-border`,
`text-muted-foreground`, `bg-primary`, `text-primary-foreground`, `bg-muted`, `ring-ring`.
Never invent hex codes, raw hsl, or a new CSS file.

Typography: Inter for body, Syne for headings with `tracking-tight`. Icons from `lucide-react`.
Cards: `rounded-xl border border-border bg-card shadow-sm`. One primary button per screen;
everything else outline or ghost. Mobile-first, tap targets at least 40px.

Layout: `PageShell` + `PageHeader` + optional `MetricCard` row + one main surface + `EmptyState`
when there is no data. Skeleton while loading. Alert + retry on failure.

If I pasted v0 output, restyle it onto these tokens before wiring data. Do not keep v0 colors or fonts.

Match the look in `templates/artform-ui/preview.html` (Apple-like, quiet, sophisticated — not a
rainbow SaaS landing page).
