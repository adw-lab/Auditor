# D20 AutoCAD Audit (QC Program)

AutoLISP audit tool for AutoCAD that validates Revit-exported panel drawings before they move downstream to EnRoute/CAM for CNC fabrication. It catches geometry and labeling problems automatically instead of relying on a human to eyeball every drawing before it becomes a cut sheet.

> **Naming note:** As of Sep 11, 2026 the program is called **QC** in documentation. Existing command names (`D20PRECHECKVIEW`, `D20ATPREADY`, …), the `D20_QC_*` / `D20_BACKUP_*` layers, and the LSP filename are kept for continuity. New commands may carry `D20*` working names for now.

---

## What it does

- **Audits** AutoCAD drawings for issues that would cause a bad cut or a rejected ATP package:
  - Open, mismatched, or missing router contours
  - Panel labels with no corresponding closed cut path (and vice versa)
  - Duplicate panel labels
  - Geometry sitting on non-contract layers
  - Blocks/attributes that need normalizing before EXPLODE
  - Zero-length or duplicate router lines from exploded exports
- **Reports** findings via an in-drawing dashboard (MTEXT) and CSV output, with FAIL/WARN severity.
- **Gates export** with `D20ATPREADY`, a readiness check meant to stop an unready drawing before it's exported for production.
- **Strips** a drawing down to the five ATP contract layers for export, with a report of what was removed.

## Status

**Baseline:** `v0.8.3` (single-file AutoLISP, ~1,138 lines)

This baseline has known defects that are fixed before any new feature work ships (see [Known Issues](#known-issues)):

| Priority | Meaning |
|---|---|
| **P0** | Fix before any v0.9.0 work or production use |
| **P1** | Fold into v0.9.0 |
| **P2** | v0.9.x / when convenient |

**Current blockers (P0):**
1. Dashboard doesn't call the function that lists FAIL reasons — the README's headline feature doesn't actually ship.
2. `D20FIX_ROUTER_SPLITS` silently flattens arcs into chords on repair.
3. `D20ATPREADY` can report READY on an empty drawing or one with mislabeled layers.
4. No repo or regression harness exists yet — this repo and an `accoreconsole` test harness are themselves P0 items.

## Installation

```
(load "D20_AutoCAD_Audit_Visual_v0_8_3.lsp")
```

Load via `APPLOAD` or a startup suite. No external dependencies — stock AutoLISP only.

## Usage

| Command | Purpose |
|---|---|
| `D20PRECHECKVIEW` | Run the full audit and open the dashboard |
| `D20ISSUES` | List FAIL/WARN issues in the command line |
| `D20ATPREADY` | Readiness gate — YES/NO before ATP export |
| `D20FIX_ROUTER_SPLITS` | Repair a split router contour pair *(currently drops arcs — see Known Issues)* |

Full command reference and layer contract are documented in `docs/D20_Layer_Contract.md` (once C2 below is resolved).

## Known issues

See `D20_Audit_Action_Items.md` for the full defect list (A1–A10) and design notes (B1–B11, C1–C5). Highlights:

- **A1** — Dashboard never surfaces FAIL reasons (function defined, never called).
- **A3** — Repairing a split router pair drops arc bulges, rebuilding radiused corners as straight chords.
- **A4** — Readiness check can false-positive on empty drawings or wrong layer names.
- **A5** — ATP export deletes anything not on the five contract layers with no per-layer warning.
- **A6** — Audit and export don't restrict to model space; paper space entities can trigger false flags.
- **A7** — Layer name comparisons are case-sensitive (AutoCAD layer names are not).
- **A8** — No error handler or undo grouping; a failed command can leave sysvars changed.
- **A9** — True-DXF export via command-line `SAVEAS` is unreliable; needs `vla-SaveAs`.

## Roadmap — v0.9.0

Block normalization, router line joining, and a stricter readiness gate.

**Milestone 1** — `D20ROUTERLINES_REPORT` (read-only chain classification), plus duplicate/zero-length line handling, coincident-endpoint polyline fixes, duplicate-label check, non-contract-layer reporting, and model-space restriction.

**Milestone 2** — `D20NORMALIZE_BLOCKS`: handle block-wrapped exports (attributes vs. TEXT, allow-listed block patterns, xref/dynamic-block refusal).

**Milestone 3** — `D20JOIN_ROUTER_LINES`: LISP classifies chains, native `PEDIT` does the join (preserves arcs); label-to-contour association by point-in-polygon; true-DXF export fix.

**Design principle:** use native AutoCAD commands (`PEDIT`, etc.) for geometry changes; keep LISP for classification, safety checks, backups, and re-auditing.

## Nest-level QC (proposed)

A companion read-only command, `D20NEST_CHECK`, validates a *placed/nested* sheet layout — panel-to-edge clearance, drill spacing, overlaps, sheet-ID uniqueness, panel counts vs. the tracker — before a nested drawing goes to production. See `QC_Workflow_Review.md` for the time/error analysis this is based on.

## Repo structure

```
/current_tool/       shipped LSP + README
/lisp/                (referenced by handoff docs — path being reconciled, see CE-02)
/test_data/           reference test DWGs + expected output CSVs
/docs/                D20_Layer_Contract.md, naming conventions
CHANGELOG.md
CLAUDE.md             agent context for Claude Code / Cursor
```

## Testing

Regression harness (planned): `accoreconsole.exe` opens each test DWG, loads the LSP, runs `D20PRECHECKVIEW`, and diffs the summary CSV against a stored expected file. Test set: 78091 WO4.2, 78091 WT1.06 (V1/V2/V3), D20 panel type library, plus one deliberately broken DWG per failure class.

Run before every release.

## Upstream/downstream dependencies

This tool sits between Revit exports and EnRoute/CAM. Several open questions with the CAM team (D30) and Revit modeling block parts of the roadmap — see `D20_Audit_Action_Items.md` §"Open questions."

## Contributing

Small, testable patches only — no silent geometry changes, always back up originals, fail-safe by default (when unsure, ATP READY = NO). See the action-item list for prioritized work.

## License

*(add license here)*
