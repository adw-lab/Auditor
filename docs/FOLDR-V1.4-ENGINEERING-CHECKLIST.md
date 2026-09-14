# Foldr v1.4 Engineering Checklist

Scope: expand the v1.4 plan into work-ready checkboxes. Each Forma panel type
has its own section covering classification, required parameters, flat pattern,
DWG CAM, Selection To Packet, and live verification.

North star (v1.4): select in elevation -> **parameter-first flat** -> **accurate CNC
DWG** (Stable) -> **production packet**, while keeping PDF-only Selection / Schedule
To Packet for detailing.

Related: [FOLDR-V3-ENGINEERING-CHECKLIST.md](FOLDR-V3-ENGINEERING-CHECKLIST.md)
(prior geometry/family audit - still useful; do not duplicate completed [x] items
blindly; re-verify where noted).

Code anchors:
- Types / aliases - `PanelTypeProfile.cs`
- Parameter flats - `FlatPatternBuilder.cs`, `PanelProfileExtractor.cs`
- CAM draw - `AutoCad/AutoCadDwgExporter.cs`, `Geometry/PerimeterEdgeModel.cs`
- Packet - `SelectionToPacketCommand.cs`, `ProductionPacketWorkflow.cs`
- Rules JSON - `Resources/forma_panel_type_rules.json`

Shared CAM baseline (Sample Panels.dwg / Forma CAM, unless a type overrides):

| Rule | Value |
|---|---|
| Perimeter fastener flange (ID21) | ~1 in |
| Sample flange depth | ~0.9688 in |
| Rivet diameter | 0.125 in |
| Rivet spacing | 16 in OC |
| Rivet end offsets | 0.75 in typical (field); confirm miter/corner ends |
| Weep diameter | 0.25 in |
| Inside corner separation | 0.08 in from center |
| ACM thickness reference | 0.17 in (4 mm) |
| Etch label | shop identity `WT.panel`, never `P-{elementId}` |

---

## 0. Cross-cutting foundations (do first)

### 0.1 Parameter-first extract (all types)

- [ ] Generalize the V.1.T early-exit in `PanelProfileExtractor.Extract` so **any**
   type with a successful `FlatPatternBuilder.TryBuild` uses that flat for
   `FinishedFace` / fold lines before 3D develop.
- [ ] Keep 3D develop as optional validation / diagnostic only when params are
   complete; log param flat vs develop delta instead of silently preferring
   develop.
- [ ] Missing required dim for a typed panel -> clear pre-export warning (do not
   invent geometry sizes for Stable DWG).
- [ ] `Width1` / `Length` / `W02` / `L02` / `L03`: prefer Revit parameters; blank
   or flag if missing - never silently invent from a projected edge for Stable.
- [ ] Zero regressions on &lt;3 vertices for parameter-complete panels (triangle
   fix must remain; bbox path stays TryCreate-hardened).

### 0.2 Classification & identity

- [ ] `Panel Type` shared parameter wins before fuzzy family/type-name matching
   (already fixed for SOFFIT PANEL / H.1.R class of bugs - keep regression test).
- [ ] Shop Panel ID / Work Ticket via `PanelIdentity.ResolveShopIdentity` -
   no synthetic etch marks on Stable paths.
- [ ] Pre-export audit shows: count by type, missing dims, rebuilt-from-params,
   unmapped `Panel Type`.

### 0.3 Shared DWG CAM (applies to every Stable type below)

- [ ] Cut polyline = finished face + flange offsets per active Forma rules.
- [ ] Bend / route lines on bend layer for each interior fold.
- [ ] Fastener holes on flange centerlines; spacing/end offsets from type rules.
- [ ] Weeps only on edges the type flags as weep-eligible
   (`WeepOnAllFaces` / `WeepOnSoffitFace` / `WeepOnSoffitReturns`).
- [ ] Soffit weeps on **outer soffit flange**, not face centerline (RB fix).
- [ ] Etch text = shop label; placement rules (~1.25 in text, right-flange heuristics).
- [ ] Sheet nesting lives in the **DWG** (material shelves); PDF nest pages stay
   deferred.

### 0.4 Workflows (product)

- [ ] Keep **Selection To Packet** / **Schedule To Packet** Stable as PDF-only.
- [ ] Promote **Selection To DWG** (Fabrication Run) to Stable ribbon.
- [ ] Add **Selection -> DWG -> Packet** combo (optional checkbox or dedicated
   command); do not force AutoCAD for PDF-only.
- [ ] Graduate **DWG To Packet** with quiet DWG inspect (etch + measured extents)
   when sidecar missing.
- [ ] Explicit gate for unsupported angled / multi-angle families (dialog, not
   silent wrong rectangle).

### 0.5 QA & rollout

- [ ] Golden fixture per type (no Revit): vertex count, area, fold count, bbox.
- [ ] Live Revit instance checklist per type (sections below).
- [ ] One-click `Foldr-v1.4` Desktop zip + Install-Foldr.cmd + EMAIL-colleagues.txt.
- [ ] Repair / Uninstall scripts + Revit is running preflight (from v3 item 6).

---

## 1. V.1.R - OneFaceFlat (`OneFaceFlat`)

**Shape:** single rectangular face. 
**Params:** `W01`, `L01` required. `W02`/`L02`/`L03` unused (blank). 
**Flat:** `W01 x L01`, **0** fold lines. 
**Aliases:** `V.1.R`, `V1R`. 
**Clean families:** `ACM V.1.R` / `ACM V1R`.

### Classification & params

- [ ] Resolves to `OneFaceFlat` from `Panel Type` = V.1.R (and V1R alias).
- [ ] Selection To Packet schedule row: W01, L01, face/cut area from params (or
   finished-face area); L02/W02 blank when absent.
- [ ] Do not upgrade to soffit/two-face merely because a ~1 in flange-looking value
   appears on W02 (face-dim min threshold already >=2 in - verify).

### Flat pattern

- [ ] `FlatPatternBuilder` returns rectangle W01 x L01, empty folds.
- [ ] Parameter-first path preferred over 3D develop when W01/L01 present.
- [ ] Golden: 4 vertices, area ~= W01 x L01, 0 folds.

### DWG CAM

- [ ] Cut envelope matches W01 x L01 (+ flange offsets) within 1 in of schedule.
- [ ] Fasteners on all four flange segments (field panel).
- [ ] Weeps per OneFaceFlat rules (baseline Sample Panels field weep policy).
- [ ] No interior bend lines.
- [ ] Etch shop ID readable on flange.

### Live verification

- [ ] One clean `ACM V.1.R` instance: Selection To Packet PDF schedule matches Revit.
- [ ] Same instance: Selection To DWG visual + measure vs Sample Panels.dwg CAM.
- [ ] Corner / miter field variants (`FLAT PANEL MITER`) confirmed still OK as
   OneFaceFlat or explicitly gated.

---

## 2. V.1.T - OneFaceTriangle (`OneFaceTriangle`)

**Shape:** right triangle, legs along +X (W01) and +Y (L01). 
**Params:** `W01`, `L01` required. 
**Flat:** triangle vertices `(0,0)`, `(W01,0)`, `(0,L01)`; **0** folds. 
**Aliases:** `V.1.T`, `V1T`, `TRIANGLE`. 
**Note:** rare in library; still Stable for packets after v1.3 fix.

### Classification & params

- [ ] Resolves from `Panel Type` / aliases; do not confuse with multi-angle
   families whose names contain `.T.` (e.g. `V.1.RB.A1.T.A1.B`).
- [ ] Area fallback: Face Area ~= 1/2 x W01 x L01 (+/-20%) may infer triangle when type
   blank - keep as diagnostic, prefer explicit Panel Type.
- [ ] Selection To Packet: face area uses triangle (1/2 x W x L) or Face Area param -
   never full W x L rectangle by mistake.

### Flat pattern

- [ ] Early parameter short-circuit remains (no elevation projection required).
- [ ] Collapsed face / bbox never throws >=3 vertices when W01/L01 exist.
- [ ] Golden: 3 vertices, area ~= 1/2 x W01 x L01, 0 folds.

### DWG CAM

- [ ] Cut is triangular (not a WL rectangle with a phantom corner).
- [ ] Flange/rivet/weep rules same CAM pack as V.1.R, applied to triangle edges.
- [ ] Perimeter edge roles valid on 3-edge outline (no 4-edge assumptions).
- [ ] Etch placement does not assume a rectangular right flange only.

### Live verification

- [ ] Selection To Packet on triangular elevation selection (v1.3 regression).
- [ ] Selection To DWG on same panel when a true V.1.T family instance exists.
- [ ] Document "no library family" status if still true; keep golden fixture anyway.

---

## 3. V.1.RB / WF - OneFaceSoffitReturn (`OneFaceSoffitReturn`)

**Shape:** finished face + soffit return unfolded coplanar. 
**Params:** `W01`, `L01`, **`W02` required** (return depth). 
**Flat:** `(W01+W02) x L01`, **1** vertical fold at `x = W01`. 
**Aliases:** `V.1.RB`, `V1RB`, `VHS.2.R.WF`, `VHS2RWF`, `WF`. 
**Clean families:** `ACM V.1.RB` (0004-0006). 
**Weeps:** soffit face **6 in OC**, min 1 row (`WeepOnSoffitFace`).

### Classification & params

- [ ] Resolves V.1.RB / WF aliases; Panel Type wins over `V1R` in family name.
- [ ] Missing W02 -> do not draw Stable DWG as plain V.1.R; warn and block or
   require confirm.
- [ ] Schedule: W01, W02, L01 present; L02 blank.

### Flat pattern

- [ ] Parameter flat = width W01+W02, length L01, fold at x=W01 full height.
- [ ] Prefer params over `FindSoffitFace` / geometry unfold when W02 present.
- [ ] Golden: 4 vertices, area ~= (W01+W02) x L01, 1 fold, fold X = W01.

### DWG CAM

- [ ] Interior bend line at soffit junction (route/bend layer).
- [ ] Fasteners: soffit-adjacent edge rules correct (no "all verticals stripped").
- [ ] Weeps on **outer soffit flange** @ 6 in OC - not centerline of soffit face.
- [ ] Confirm `WeepOnSoffitFace` path (not blanket type-key only).
- [ ] Etch on finished-face flange (not buried in return).

### Live verification

- [ ] Live `ACM V.1.RB` instance: measure W01, W02, L01 vs DWG cut + fold.
- [ ] Weep count/placement shop-check vs VHS.WF notes.
- [ ] Selection To Packet areas/dims match parameters.

---

## 4. V.2.R - TwoFace (`TwoFace`)

**Shape:** two finished faces stacked in length. 
**Params:** `W01`, `L01`, **`L02` required**. 
**Flat:** `W01 x (L01+L02)`, **1** horizontal fold at `y = L01`. 
**Aliases:** `V.2.R`, `V2R`. 
**Clean families:** `ACM V.2.R.ADJUST`, `ACM V2R`. 
**Dims language:** ID1=Y, ID2/ID3=X per face; ID21=1 in flange.

### Classification & params

- [ ] Resolves V.2.R; adjustable variant uses same rules.
- [ ] Missing L02 -> warn/block Stable DWG (do not emit single-face rectangle).
- [ ] Schedule carries L02; W02 blank unless truly present.

### Flat pattern

- [ ] Parameter flat wins over primary-face-only 3D develop.
- [ ] Fold at y=L01 across full width.
- [ ] Golden: area ~= W01 x (L01+L02), 1 horizontal fold.

### DWG CAM

- [ ] Cut height = L01+L02 (+ flanges), not L01 alone.
- [ ] One interior bend line.
- [ ] Fasteners/weeps on field edges per TwoFace profile (not soffit flags).
- [ ] Confirm angled variants (`ACCUTE.ANGLEDFACE`) are gated or use family angle
   params - not silent fixed `BuildingCornerAngleDegrees`.

### Live verification

- [ ] Live V.2.R: DWG cut vs W01 / L01 / L02 within 1 in.
- [ ] Packet schedule L02 matches Revit parameter.
- [ ] Visual fold location vs SolidWorks-style naming (L01 lower, L02 upper).

---

## 5. V.3.R - ThreeFace (`ThreeFace`)

**Shape:** three faces stacked in length. 
**Params:** `W01`, `L01`, **`L02` + `L03` required**. 
**Flat:** `W01 x (L01+L02+L03)`, **2** horizontal folds at `y=L01` and
`y=L01+L02`. 
**Aliases:** `V.3.R`, `V3R`. 
**Clean families:** `ACM V.3.R`. 
**Weeps:** weep edge **all faces** (`WeepOnAllFaces`).

### Classification & params

- [ ] Resolves V.3.R; missing L02 or L03 -> warn/block Stable DWG.
- [ ] Schedule: L02 and L03 columns populated from params (L03 via Length 3 / L03).

### Flat pattern

- [ ] Parameter flat with two folds; do not accept develop that only captured
   primary face.
- [ ] Golden: area ~= W01 x (L01+L02+L03), 2 folds at expected Y.

### DWG CAM

- [ ] Cut length sums three face lengths.
- [ ] Two bend lines on route layer.
- [ ] Weeps on all face weep-eligible edges (ThreeFace flag).
- [ ] Gate angled variants (`A2`, `PARTIAL ANGLE`, `Right Leg Angled`) until
   angle-aware CAM exists.

### Live verification

- [ ] Live V.3.R instance end-to-end (packet + DWG).
- [ ] Shop check weep presence on each face edge.

---

## 6. V.2.RB / WR - TwoFaceSoffitReturn (`TwoFaceSoffitReturn`)

**Shape:** two faces + soffit return (grid unfold). 
**Params:** `W01`, `L01`, **`W02` + `L02` required**. 
**Flat:** `(W01+W02) x (L01+L02)`, folds: vertical `x=W01` **and** horizontal
`y=L01`. 
**Aliases:** `V.2.RB`, `V2RB`, `VHS.2.R.WR`, `VHS2RWR`, `WR`. 
**Clean families:** `ACM V.2.RB`. 
**Weeps:** soffit **returns** @ **19 in OC**, min 2 (`WeepOnSoffitReturns`).

### Classification & params

- [ ] Resolves V.2.RB / WR; upgrade from TwoFace when W02 is a real face dim.
- [ ] Missing W02 or L02 -> warn/block Stable DWG.
- [ ] Schedule includes W02 and L02.

### Flat pattern

- [ ] Grid fold pattern from params (not front-face-only develop).
- [ ] Golden: area ~= (W01+W02) x (L01+L02), 2 folds (one V, one H).

### DWG CAM

- [ ] Both interior bend lines present.
- [ ] Fastener eligibility excludes only true soffit-adjacent edges.
- [ ] Weeps on soffit **return** flanges @ 19 in OC, min 2 - outer flange, not
   face centerline.
- [ ] Confirm `WeepOnSoffitReturns` path separately from V.1.RB's 6 in soffit-face
   path.

### Live verification

- [ ] Live `ACM V.2.RB`: measure both face dims + return vs DWG.
- [ ] Weep count >= 2 on return; spacing ~19 in.
- [ ] Packet dims match parameters.

---

## 7. Per-type matrix (quick reference)

| Type | Key | Required params | Flat size | Folds | Weep policy |
|---|---|---|---|---|---|
| V.1.R | `OneFaceFlat` | W01, L01 | W01 x L01 | 0 | Field baseline |
| V.1.T | `OneFaceTriangle` | W01, L01 | triangle legs W01 x L01 | 0 | Same CAM as V.1.R |
| V.1.RB | `OneFaceSoffitReturn` | W01, L01, W02 | (W01+W02) x L01 | 1 vertical @ W01 | Soffit face 6 in OC |
| V.2.R | `TwoFace` | W01, L01, L02 | W01 x (L01+L02) | 1 horizontal @ L01 | Field / non-soffit |
| V.3.R | `ThreeFace` | W01, L01, L02, L03 | W01 x (L01+L02+L03) | 2 horizontal | All faces |
| V.2.RB | `TwoFaceSoffitReturn` | W01, L01, W02, L02 | (W01+W02) x (L01+L02) | 1 V + 1 H | Soffit returns 19 in OC |

For **each** row above, Stable exit criteria:

- [ ] Parameter-first flat implemented and golden-tested
- [ ] Selection To Packet schedule correct
- [ ] Selection To DWG CAM shop-checked on >=1 live instance (or documented gap)
- [ ] Sidecar schedule rows match params for closed-loop packet

---

## 8. Closed-loop & DWG inspect

### 8.1 Selection -> DWG -> Packet

- [ ] After DWG export, write `.vendorart.json` with parameter-true schedule rows.
- [ ] `ProductionPacketWorkflow.GenerateToFile` consumes sidecar (cover + schedule).
- [ ] Combo UX: one command or Fabrication Run "also create packet" checked by
   default for Stable fab users.
- [ ] PDF-only Selection To Packet unchanged (no AutoCAD required).

### 8.2 DWG To Packet (inspect)

- [ ] Prefer sidecar when present.
- [ ] Without sidecar: read etch text (label layer) for Panel ID.
- [ ] Without sidecar: measure cut / finished extents from cut + route layers.
- [ ] Map measured panels to schedule rows; flag unmatched / ambiguous.
- [ ] Promote command from In Development when inspect passes sample DWGs.

---

## 9. Family / variant gates (carry from v3 audit)

- [ ] Department 20 decision: `ACM C3R`, `H.1.R` new keys or aliases?
- [ ] Tessellated `V.1.R.TES.*` - do not treat as plain V.1.R CAM without warning.
- [ ] Angled corner variants Stable gate until angle params drive CAM.
- [ ] Confirm accessory categories (CAM Art, annotations, Dept 10 trim) are
   excluded from panel selection filters.

---

## 10. Suggested sequencing (checklist order)

1. **0.1-0.2** Parameter-first extract + identity (unlocks every type equally).
2. **1-6** Per-type flat + golden fixtures (code can land in parallel; live
  verify one type at a time).
3. **0.3 + live DWG** for V.1.R -> V.2.R -> V.3.R -> V.1.RB -> V.2.RB -> V.1.T.
4. **8** Closed loop + DWG inspect.
5. **0.4-0.5 + 9** Ribbon, Hub lite, installer, family gates, v1.4 zip.

---

## 11. Explicit non-goals (still deferred)

- [ ] ~~PDF nest / shelf plot pages~~ deferred past v1.4 unless shop demands.
- [ ] ~~Full precedent-learning UX overhaul~~ Forma type packs remain rules source.
- [ ] ~~enRoute DXF as Stable requirement~~ optional / In Development.
- [ ] ~~Replace Revit schedules as authoring~~ params + schedule views stay source.
