# Foldr V.1.R Panel Fabrication Standards

This document compiles the V.1.R panel drawing rules gathered from the sample PDFs, DWG inspection, exported family data, and implementation discussions for Foldr V.1.R flat ACM panel DWG output.

## V.1.R Drawing Goal

- Foldr must draw V.1.R panels accurately when the AutoCAD DWG opens from Revit.
- V.1.R DWG output must use one authoritative clean panel drawing path.
- Legacy, multi-face, or conflicting panel drawing logic must not silently affect V.1.R output.
- If a selected family resolves to V.1.R but contains multi-face dimensions, Foldr must not silently draw it as V.1.R.

## V.1.R Applicability

- These standards apply only to V.1.R flat ACM panels.
- V.1.R standards apply to panels where the short side is the panel width and the long side is the panel length.
- The `<48" W` and `<120" L` note describes the small-panel rivet layout condition; it is not a global on/off switch for rivets.
- Width and length should be evaluated from the actual fabrication extents, not from a misleading parameter orientation.

## DWG Layers

- Panel cut geometry uses `ACM_Layer 1_Router Offset_Panel Cut`.
- Route / bend / V-groove geometry uses `ACM_Layer 3_Open Offset Countour_Route Lines`.
- Rivet drill centers use `ACM_Layer 4_Drill Centers_Rivet Holes`.
- Weep drill centers use `ACM_Layer 5_Drill Centers_Weep Holes`.
- Finished panel face color is cyan.

## V.1.R Base Geometry

- The panel face is drawn as the finished face.
- The finished face should be visually distinct from flange, route, rivet, and weep geometry.
- Flanges are 90-degree return flanges.
- Rivets are placed on flange centerlines, not on the face interior.
- Weeps are placed on the bottom flange only.

## Rivet / Fastener Standards

- Rivets are required on all four flanges.
- Rivet drill-center radius is `0.0625` inches.
- Rivet start offset is `0.75` inches after the square corner / route-relief offset.
- Each end of each flange receives a double-rivet pair.
- A double-rivet pair means two holes.
- The two holes in each double-rivet pair are 1 inch apart from each other.
- The first double pair starts after the square corner / route-relief offset.
- The ending double pair is placed before the square corner / route-relief offset at the opposite flange end.
- For small panels under the PDF note condition, intermediate rivets between the end double pairs are individual single rivets.
- For larger panels, every rivet station is a double-rivet pair, including intermediate 16-inch OC stations.
- Intermediate single rivets are spaced at 16 inches on center when possible.
- If exact 16-inch spacing does not fit cleanly, intermediate spacing should be equalized while keeping the end double pairs fixed.
- A flange with enough run length follows this pattern:
  - Start double pair.
  - 16 inches.
  - Single rivet.
  - 16 inches.
  - Additional single rivets as needed.
  - End double pair.

## Weep Standards

- Weeps are only on the bottom flange.
- Weeps are not on the top flange.
- Weep drill-center radius is `0.125` inches.
- The first weep starts from the rivet layout, 1 inch after the starting double-rivet pair.
- The last weep ends from the rivet layout, 1 inch before the ending double-rivet pair.
- Weeps are spaced at no more than 24 inches on center.
- If exact 24-inch spacing does not fit, intervals must be equalized as closely as possible.
- First and last weeps remain anchored relative to the end double-rivet pairs.
- Equalized intervals between weeps must not exceed 24 inches on center.
- Weeps must not collide with rivet holes.

## Drill Center Collision Rules

- Rivet holes must not duplicate each other.
- Weep holes must not duplicate each other.
- Weeps must not occupy the same drill center as rivets.
- When equalized weep positions conflict with rivets, increase the number of weep intervals until the conflict is removed while preserving first and last weep anchors.

## V.1.R Corner Standards

- V.1.R route lines form a square 90-degree corner condition at every panel face corner.
- The route lines create a small square / rectangular 90-degree relief area at each corner.
- The red outer flange / cut line is trimmed by the cyan route line at each relief.
- The trimmed red cut line must not run through the square route relief.
- The corner relief is not a diagonal miter.
- The corner relief is not one-sided.
- The corner relief happens at all four panel face corners.
- The flange edges meet at a square 90-degree angle at every panel face corner.
- Rivet offsets are measured after those square route-corner relief references.
- Rivets are not measured from diagonal relief, miter, or notch geometry.
- Weep offsets are measured from the rivet layout, not directly from the panel corner.
- The dependency chain is: square route-corner relief, rivet pair offset, then weep offset from the rivet pair.
- Route geometry at the flange corner should preserve horizontal/vertical 90-degree relationships.
- The primary outer cut perimeter remains the complete rectangular flange boundary.

## AutoCAD Export Behavior

- DWG generation should not fail silently.
- Slow AutoCAD startup must be distinguishable from failure.
- Foldr should prevent overlapping export runs while AutoCAD is still generating a DWG.
- If a second export is triggered while one is active, Foldr should show a clear message and avoid starting another run.

## Source Observations Captured

- Sample PDFs established rivet, weep, fastener, drill-center, and corner drawing intent.
- Sample DWG inspection confirmed ACM layer names and hole/route layer usage.
- Sample PDF inspection confirmed route lines form 90-degree corners around the panel face.
- Sample PDF inspection confirmed rivets start after the corner offset, not at the corner.
- Sample PDF inspection confirmed flange depth / edge dimension around `0.97` inches.
- Exported V.1.R family data was used to verify relevant panel parameters and distinguish V.1.R from multi-face panel geometry.

## V.1.R Implementation Standard

- Keep one authoritative V.1.R drawing path.
- Do not maintain competing active rivet, weep, flange, or corner drawing systems.
- Add future geometry changes to the clean fabrication geometry path.
- Prefer explicit user-facing errors over fallback geometry when panel identity or dimensions conflict.
- Preserve DWG layer names exactly unless the shop standard changes.
