# Foldr v3 Engineering Checklist

Scope: the six workstreams called out for v3. Each item is grounded in the current
codebase (file:line references point at the v2 state as of 2026-07-21) so this can
be worked top-to-bottom without a re-discovery pass.

## 1. Draw the 6 main panel types accurately in DWG

Panel types (`PanelTypeProfile.cs:58-63`): `OneFaceFlat` (V.1.R), `OneFaceTriangle`
(V.1.T), `TwoFace` (V.2.R), `ThreeFace` (V.3.R), `OneFaceSoffitReturn` (V.1.RB / WF),
`TwoFaceSoffitReturn` (V.2.RB / WR).

**Deprioritized (2026-07-21):** per Department 20, triangle panels (`OneFaceTriangle`
/ V.1.T) are not a regularly-occurring panel type in practice. We couldn't even locate
a dedicated V.1.T family in the library (the closest name match,
`V.1.RB.A1.T.A1.B`, turned out to be an unrelated multi-angle corner/transition
family — 4 angles, 4 flange-length formulas, not a simple triangle). Active
verification work now focuses on the 5 rectangular types below; triangle support
relies on the existing geometry-based fallback (`PanelTypeProfileCatalog.LooksTriangular`,
`PanelTypeProfile.cs:305-315`) until it's shown to matter in practice.

**Real-data verification status (via `Extract Family Parameters`, 2026-07-21):** all
5 rectangular types now confirmed correctly classified end-to-end against real
family data — `Panel Type` resolves correctly (directly or via safe name-fallback)
for OneFaceFlat, OneFaceSoffitReturn, TwoFace, TwoFaceSoffitReturn, and ThreeFace,
including their angled-corner variants. Remaining risk for those variants is
downstream corner-angle geometry math, not type classification — see the angled
variants table in 2a.

- [x] Run one clean-match representative per base type (see 2a's "clean matches"
      table) through real family-parameter extraction to confirm `Panel Type`
      classification. (Superseded the original plan to do this via DXF export —
      family-data extraction gave a faster, more direct answer.) Triangle skipped
      per the deprioritization above.
- [x] Verify `PerimeterEdgeModelBuilder` role tags (bend / fastener / weep-eligible)
      per type, especially the soffit-return variants where soffit-adjacent edges
      must be excluded from fastener/bend eligibility. Fixed two bugs
      (`PerimeterEdgeModel.cs`): (1) `SupportsFasteners`' old adjacency-exclusion
      zeroed out fasteners on ALL vertical edges of a 4-edge rectangle for
      `OneFaceSoffitReturn`/`TwoFaceSoffitReturn`, not just the soffit-adjacent
      ones — removed; (2) which edge counts as "the soffit edge" is now derived
      from real 3D geometry (`PanelProfileExtractor.FindSoffitFace`, welded-edge
      detection) instead of a fixed edge-index heuristic, since orientation
      varies per instance. Verified via a standalone reflection harness (no
      Revit dependency) against the pure-geometry logic; not yet confirmed
      against a live Revit V.1.RB/V.2.RB instance.
- [x] **2026-07-21 — found and fixed a second, more foundational gap:** TwoFace/
      ThreeFace/TwoFaceSoffitReturn panels were only ever drafting their front
      face — `FindFrontFace` picks the one view-facing planar face, and `Width2`
      was carried purely as a schedule-column number, never added to the cut
      geometry. The DWG flat pattern for a V.2.RB was indistinguishable in shape
      from a plain one-face panel. Fixed in `PanelProfileExtractor.cs`: new
      `ExtendForAdjacentFaces` walks outward across shared 3D edges from the
      front face (skipping the soffit face) to find each additional face, measures
      its real span from 3D area/edge-length (not a fixed parameter, since fold
      width/angle vary per instance — "it has to come from the actual geometry"),
      and unfolds it into `FinishedFace`. Interior fold lines are recorded
      (`PanelProfile.InteriorFoldLines`) and drawn on the existing bend-line layer
      by both `AutoCadDwgExporter` and `DxfWriter`. Self-limiting by geometry (0
      additional faces found for one-face types, 1 for TwoFace/TwoFaceSoffitReturn,
      2 for ThreeFace) — no type input needed in the extractor. Not yet verified
      against live Revit geometry (can't run Revit from this environment); needs
      a real V.2.R/V.2.RB/V.3.R instance check next.
- [ ] Confirm soffit-return panels (WF/WR) draw the correct bend-line count for the
      return, and that weep placement matches `WeepOnSoffitFace` /
      `WeepOnSoffitReturns` flags rather than the blanket type-key check at
      `AutoCadDwgExporter.cs:1100`.
- [ ] Audit `ResolveActiveExportRules` (`AutoCadDwgExporter.cs:405-415`) — confirm
      there's no silent mismatch when a panel-type rule pack and a project profile
      rule pack disagree on flange depth for the same panel.
- [ ] Add golden-output regression fixtures (one sample panel per type) so a future
      geometry refactor can't silently break one shape without a test failing.

## 2. Improve precision detection & family awareness

### 2a. Real-family categorization (Department 20 Revit Family Library audit, 2026-07-21)

Cross-checked every family in
`Artform Dropbox\Administration\Department Folders\Department 20\1_REVIT\Revit Family Library`
against `PanelTypeProfileCatalog.FamilyCodeAliases` (`PanelTypeProfile.cs:58-63`) and its
substring-match logic (`ResolveFromSignals`, `PanelTypeProfile.cs:294-300`). Grouped by
how confident/correct the current match is:

**Clean matches — no action needed**
| Family | Base type | Notes |
|---|---|---|
| `ACM V.1.R` / `ACM V1R` | OneFaceFlat | |
| `ACM V.1.RB` (0004-0006) | OneFaceSoffitReturn | |
| `ACM V.2.R.ADJUST` | TwoFace | adjustable variant, same rules |
| `ACM V.2.RB` | TwoFaceSoffitReturn | |
| `ACM V2R` | TwoFace | |
| `ACM V.3.R` | ThreeFace | |

**RESOLVED — was misdiagnosed from filename alone, confirmed via `Extract Family Parameters` (2026-07-21)**
| Family | Filename suggested | Actual `Panel Type` param | Status |
|---|---|---|---|
| `ACM V1R SOFFIT PANEL.0001.rfa` | OneFaceFlat or OneFaceSoffitReturn (name has "V1R"/"SOFFIT") | **`H.1.R.A3`** | Neither guess was right. This is the same unmapped `H.1.R` family code as `ACM H.1.R.X1` below — not a V.1.x variant at all. Fixed `ResolveFromSignals` (`PanelTypeProfile.cs`) to trust the `Panel Type` shared parameter alone before falling back to fuzzy family/type-name matching, so this no longer silently matches "V1R" from the filename/type-name text. It now correctly falls through to "unmapped" instead of a wrong match — see `H.1.R` below for the remaining gap. |

**Unmapped entirely — silently default to OneFaceFlat's rules today**
| Family | Why it's unmapped | Risk |
|---|---|---|
| `ACM C3R` (4_ACM C3R) | "C3R" isn't a substring of any alias | Falls through to the hardcoded `OneFaceFlat` default (`PanelTypeProfile.cs:187-188`) — a corner/3-face panel getting 1-face flange/fastener/weep rules is a real fabrication risk, not just a labeling gap. |
| `H.1.R` — confirmed real, recurring code: `ACM H.1.R.X1` (ACM H1R folder) **and** `ACM V1R SOFFIT PANEL.0001.rfa`'s actual type `H.1.R.A3` | No alias for "H.1.R" at all | Extracted parameters (`H.1.R.A3` type) show `A01`/`A02`/`A03` (three angle params) + `PD01` + `HORZ. CLIP DIM`/`VERT CLIP DIM` — a materially different parameter set from any of the 6 current types, reads like a distinct multi-angle/hip geometry. Needs Department 20 to confirm whether this is a 7th `PanelTypeKey` or a variant of an existing one — extracted data alone can't decide that. Next step: extract `ACM H.1.R.X1.rfa` too and compare its parameter set against `H.1.R.A3`'s to see if `H.1.R` is one consistent type (like V.1.R/V.1.RB) or looser. |
| `V.1.R.TES.P1` (6_TESSELLATE) | Matches OneFaceFlat correctly by substring, but... | ...a tessellated/pattern-routed panel isn't fabricated like a plain flat sheet. Matching isn't the bug; treating it identically is. |
| `ACM V1R.X1.BR` | Unclear — "BR" undefined; not yet extracted | Matches OneFaceFlat via "V1R" today (still unverified whether its real `Panel Type` param agrees or, like the SOFFIT PANEL family above, actually says something else). Extract and check before assuming the name is trustworthy. |

**Angled/non-standard-corner variants — match the right type, geometry math may not hold**
`CncSettings.BuildingCornerAngleDegrees` and the corner-adjustment code
(`AutoCadDwgExporter.AdjustCornerFastenerFlangeSegments`) assume a fixed corner angle:
| Family | Matches as | Variant |
|---|---|---|
| `ACM V.2.R.ACCUTE.ANGLEDFACE` | TwoFace | acute-angle face |
| `ACM V.3.R.A2` | ThreeFace | "A2" angle variant |
| `ACM V.3.R.PARTIAL ANGLE` | ThreeFace | partial/non-standard corner angle |
| `ACM V3R-Right Leg Angled` (5_ACM V3R-Right Leg Angled) | ThreeFace | angled leg |

**No code, defaults to OneFaceFlat — likely fine**
`ANGLED CORNER FLAT PANEL MITER`, `FLAT PANEL MITER` (1_ACM V1R) — no family code at
all; the OneFaceFlat default is probably correct here since they read as flat-panel
variants, but worth a quick confirm rather than assuming.

**Out of scope for panel-type detection (accessories/annotations, not panel faces)**
`7_CAM Art` (rivet/hole/flange/grain-direction nested families), `8_Annotations`
(tags/title blocks), and the entire Department 10 `Artform Product Families` library
(Angle, Box Rib, Drip Flashing, Furring, Jamb Flashing, Resins, Wall Cleat — all 2018-era
trim/hardware families). Worth confirming Foldr's "select Artform panel instances"
filter actually excludes these categories.

**Action items from this audit**
- [ ] Get a decision from Department 20 on `ACM C3R` and `ACM H.1.R.X1` — new
      `PanelTypeKey` values, or aliases onto an existing type?
- [ ] Fix the substring-match ordering/specificity bug that misclassifies
      `ACM V1R SOFFIT PANEL` as OneFaceFlat.
- [ ] Decide whether angled-corner variants (acute face, partial angle, right-leg
      angled) need their own corner-angle parameter read from the family instead of
      the fixed `BuildingCornerAngleDegrees` constant.
- [ ] Re-run this same audit against Department 10's Shared Parameters once that
      Dropbox (Old) access issue is resolved — cross-check actual shared-parameter
      names against `PanelSharedParameterSignals.cs`'s hardcoded name lookups.

- [ ] Extend `PanelTypeProfileCatalog.Resolve` so unlabeled families (no family-code
      shared parameter) get a best-guess type from geometry (side count / angles)
      instead of defaulting silently — surface the guess with a confidence flag.
- [ ] Audit `PanelTypeProfile.cs:58-63`'s family-code alias table against real
      project family naming variants; add missing aliases rather than letting them
      fall through to the geometry-guess path.
- [ ] Apply the "must come from a real parameter, else blank/flagged — never
      geometry-inferred" rule (already applied to W02 this session,
      `PanelProfileExtractor.cs:36-39`) to the remaining geometry-inferred fallback:
      `Width1`'s fallback to `horizontalLengths[0]` (`PanelProfileExtractor.cs:36-37`).
      Decide per-field whether geometry inference should survive v3 or become a
      flagged warning instead.
- [ ] Track *why* each resolved value (panel ID, workticket, W01/L02/W02) won —
      `PanelIdentity.Prefer`'s fallback chains currently resolve silently. This is a
      prerequisite for the data-source column in item 3.

## 3. Pre-export preview report

New step before "New Fabrication Run" / "Selection to Packet" actually writes
anything — a review form/report listing:

- [ ] Total panel count and a breakdown by detected panel type / family code.
- [ ] Per-panel (or summarized) **data source used**: Revit parameter, matched
      schedule/CSV row, or geometry-inferred — requires the source-tracking from
      item 2.
- [ ] **Parameter vs. schedule conflict warnings** — e.g. a Revit parameter value
      (Width1, Length, Workticket) disagrees with a matched schedule/CSV row beyond
      tolerance. `PanelProfileExtractor.cs:60-67` already detects one class of this
      (extracted face vs. parameters) and just logs + silently rebuilds — promote
      that class of mismatch (and the schedule-row equivalent) to a visible,
      pre-export warning instead of a log line.
- [ ] Block or require explicit confirmation before export when conflicts exist,
      rather than the current behavior of silently picking a winner.

## 4. Improve Selection to Packet reliability

- [ ] Route Selection to Packet through the new pre-export preview (item 3) before
      generating the PDF.
- [ ] Surface `ScheduleBinder`'s match strategy/confidence (`ScheduleBinding.cs`,
      `MatchStrategy`/`Confidence`) to the user instead of only logging via
      `PanelDecisionReport` — flag "ambiguous size" and "unmatched" panels for
      review before the packet is generated.
- [ ] Add explicit handling/messaging for AutoCAD Core Console / Python subprocess
      failures in `ProductionPacketWorkflow.cs` (currently surfaces raw
      stdout/stderr through `FoldrDialogs.ShowError`) — tie into the diagnostics
      bundle in item 5.
- [ ] Re-test Selection to Packet against the L02/W02 and Workticket fixes made
      this session on a broader panel-shape sample (rectangles, triangles, corner
      panels) to confirm no regressions.

## 5. Clearer error messages & export diagnostics

- [ ] Audit every `throw new InvalidOperationException(...)` across the export
      commands (`ScheduleExportAudit.cs`, `ProductionPacketScheduleExtractor.cs`,
      `AutoCadDwgExporter.cs`, `ProductionPacketWorkflow.cs`) for message quality:
      what failed, which panel/workticket/row, and what the user should do next.
      Several of these were found overly strict or opaque this session (WT
      requirement, width/length requirement) — treat this as a systematic pass, not
      just the two already fixed.
- [ ] Add a "Foldr Diagnostics" command/export that bundles `FoldrLog` output, the
      last run's temp metadata JSON, and the resolved panel list into a single zip
      a coworker can attach to a support request, instead of a screenshot of the
      exception dialog.
- [ ] Standardize on one error-reporting path (`FoldrDialogs.ShowError` /
      `RevitTaskDialog.Show`) across all commands — confirm none still surface a
      bare `exception.Message` without context (file, workticket, command name).

## 6. Uninstall / repair installer for coworkers

Current state: `install.ps1` and `package-release.ps1`'s generated
`Install-Foldr.ps1` only install. On a DLL lock (Revit still open) they silently
fork a new timestamped DLL (`Foldr-YYYYMMDD-HHMMSS.dll`) and rewrite the `.addin`
manifest to point at it — this session's install folder had **13 stale timestamped
DLLs** accumulated with no cleanup path.

- [ ] Add `Uninstall-Foldr.ps1` — removes
      `%AppData%\Autodesk\Revit\Addins\2027\Foldr\` and the `Foldr.addin` manifest
      cleanly (with a Revit-running pre-flight check rather than a silent partial
      removal).
- [ ] Add `Repair-Foldr.ps1` — detects and clears stale timestamped DLLs, re-copies
      a known-good build, and rewrites the manifest; use this to replace the
      current silent fork-and-rename behavior in `install.ps1`/`Install-Foldr.ps1`.
- [ ] Add a pre-flight "Revit is running" check shared by install/repair/uninstall
      (e.g. `Get-Process Revit -ErrorAction SilentlyContinue`) that prompts the user
      to close Revit instead of silently forking a new DLL.
- [ ] Write a `VERSION` file (or embed/read the assembly version) on install so
      Repair can verify success and coworkers/support can report "what version" at
      a glance.
- [ ] Bundle `Repair-Foldr.cmd` / `Uninstall-Foldr.cmd` launchers alongside
      `Install-Foldr.cmd` in `package-release.ps1`'s output zip so the rollout
      package is a complete toolkit, not install-only.

## Suggested sequencing

1. **Item 2** (family/precision awareness) and **item 1** (panel type accuracy)
   first — they're the geometric/data foundation everything else reports on.
2. **Item 3** (preview report) next — it depends on item 2's source-tracking and
   directly de-risks item 4.
3. **Item 4** (Selection to Packet reliability) and **item 5** (errors/diagnostics)
   together — same error-surfacing infrastructure serves both.
4. **Item 6** (installer tooling) is independent of the others and can run in
   parallel on its own track.
