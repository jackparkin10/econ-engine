# Econ Engine — Project Constitution (AI Rules)

This document is the **source of truth** for how this codebase is structured and how new work must be done. When in doubt, follow this file before inventing new patterns.

---

## 1. Purpose

**econ-engine** is a config-driven economics learning app. Chapters teach supply/demand, equilibrium, elasticity, and related topics through four **modes**: Book, Animate, Build, and Explore.

**Non-negotiable:** Behavior lives in **chapter config** and the **graph engine**, not in React components. Components render what config describes.

---

## 2. Core principles

1. **Config over components** — No chapter-specific `if (chapterId === …)` logic in `GraphCanvas`, `DisplayPanel`, or `ControlPanel`. Add fields to `ChapterConfig` and resolve them in the engine.
2. **Schema-driven graphs** — Curves, equilibria, arrows, labels, and step visibility are declared in config; the canvas composes layers.
3. **Themes are centralized** — Visual styling (fonts, colors, arrow/callout chrome) comes from `src/config/graphThemes/`, referenced by `graphThemeId` on each chapter.
4. **Economic coordinates** — By default **quantity (Q) is on the horizontal axis** and **price (P) is on the vertical axis**. Curve control points use `{ x: Q, y: P }` unless `graphCoordinates` overrides.
5. **Minimal diffs** — Match existing naming, file layout, and types. Extend registries and config; do not duplicate rendering paths.

---

## 3. Repository layout

```
src/
  config/
    chapterRegistry.ts          # Register all chapters here
    chapters.ts                 # Market equilibrium chapter
    increaseInSupplyChapter.ts  # One file per major chapter (preferred)
    elasticityChapter.ts
    graphThemes/
      index.ts                  # Theme registry + getGraphTheme()
      textbook.ts               # Default textbook look (Gill Sans, RGB swatches)
      legacy.ts                 # Older app styling
      types.ts
  assets/
    chapters/
      <chapter-id>/            # e.g. chapter-increase-in-supply/
        book.png               # Optional static book figure
      index.ts                  # Re-export images for chapter configs
  components/
    core/                       # App shell, chapter page, canvas, panels
    graph/
      graphArrow.tsx            # Callout arrows (unified shape, curved support)
  engine/
    types.ts                    # ChapterConfig, CurveSpec, BuildStep, etc.
    graphEngine.ts              # Scales, paths, equilibria, curved arrows
    curveIntersection.ts        # throughPoints ∩, Catmull–Rom sampling
    curveRegistry.ts            # curveType → generator
    resolveGraphStyle.ts        # Theme + chapter → resolved styles
    strategies/                 # Per graphType helpers (supply/demand, elasticity)
  theme/                        # App chrome (Tailwind), not graph textbook colors
```

**Register every new chapter** in `src/config/chapterRegistry.ts`.

---

## 4. Chapter configuration contract

Each chapter exports a `ChapterConfig` (`src/engine/types.ts`). Typical fields:

| Area | Fields | Notes |
|------|--------|--------|
| Identity | `id`, `title`, `description`, `themeColor` | `id` matches folder names under `assets/chapters/` when used |
| Theme | `graphThemeId` | Usually `'textbook'` |
| Layout | `graphLayout` | e.g. `{ equalAxisLengths: true }` for square plot |
| Axes | `xAxis`, `yAxis` | Labels, min/max, ticks, `tickFormat`, y-axis `titleAboveMaxTick`, `titleRotation`, offsets |
| Curves | `curves[]` | See §5 |
| Equilibria | `equilibria[]` | Prefer over legacy `equilibriumPoint` |
| Book | `bookBuildStepId` **or** `bookView` **or** `bookLayers` | See §7 |
| Modes | `buildSteps`, `animationSteps`, `exploreControls`, `exploreLayers` | |
| Labels | `curveLabels[]` | Position in Q–P space; `anchor`, `offsetX`, `offsetY` |
| Arrows | `graphArrows[]` | See §8 |
| Copy | `modeContent.book`, `modeContent.animate` | Shown in control panel |

**Do not** hardcode pedagogy in components—add a config field and resolve it in `GraphCanvas` / `resolveGraphStyle` / `graphEngine`.

---

## 5. Curves

- **`curveType`** must exist in `src/engine/curveRegistry.ts` (e.g. `demand`, `supply`, `throughPoints`, elasticity types).
- **`throughPoints`** — Smooth Catmull–Rom curves defined by `params.points: { x, y }[]` in Q–P space. Used for textbook supply/demand chapters.
- **`colorRole`** — Keys into `graphThemes/*/colors.roles` or `colors.callouts` (e.g. `demand`, `supplyInitial`, `equilibrium`). Avoid raw hex in chapter config unless necessary.
- **`visible: false`** — Curve hidden by default; Build/Explore/Book steps control visibility via `visibleLayers` / `exploreLayers` / `bookBuildStepId`.
- **`animated: true`** — Draw-in via path animation on first reveal (Build). Target curves that slide in use `morphFromCurveId` instead of redraw (see §6).
- **`morphFromCurveId`** — When this layer appears, animate from the source curve’s shape to this curve’s shape **without** hiding the source (e.g. S₀ stays visible while S₁ slides in).

---

## 6. Equilibria

- Declare `equilibria[]` with `demandCurveId`, `supplyCurveId`, `id`, and `colorRole`.
- Intersection for `throughPoints` curves is computed in `curveIntersection.ts` / `graphEngine.ts`—**do not** hardcode `point` unless unavoidable.
- **Build steps** control which equilibria and guide lines show:
  - `showEquilibrium`, `visibleEquilibria[]`
  - `showPriceLine`, `showQuantityLine`
- **Market equilibrium** uses red guides: `colorRole: 'supplyInitial'` on the equilibrium spec.

---

## 7. Modes (Book, Build, Animate, Explore)

Handled in `ChapterPage` + `GraphCanvas` + `ControlPanel`.

### Book
- Prefer **`bookBuildStepId`** — Live graph matches that build step (layers, equilibria, arrows).
- Optional **`bookView`** — Static image via `ChapterBookView` + `src/assets/chapters/<id>/book.png`.
- Fallback: **`bookLayers`** — list of curve ids only.

### Build
- Steps in **`buildSteps`** with `visibleLayers: string[]` (curve ids). Empty array = axes only.
- Before first step (`activeStep === -1`), graph shows **no curves**.
- Step snapshot drives curves, equilibria, and `visibleAnnotations` (arrow ids).
- **Do not** rely on `visible: true` on curves for Build visibility—use `visibleLayers`.

### Animate
- **`animationSteps`** with `layerIds` / `annotationIds`. Keep consistent with build pedagogy.

### Explore
- **`exploreLayers`** — which curves are eligible.
- **`exploreControls`** with `targetKey` (not legacy `id` for binding).
- Elasticity: slider level maps to one curve id in `GraphCanvas` (no path redraw of all curves at once).
- Supply/demand surplus/shortage: `exploreScenarios` + `supplyDemandStrategy.ts`; use `quantityAtPrice` for `throughPoints` curves.

---

## 8. Graph arrows and callouts

Defined in chapter `graphArrows[]`, rendered by `src/components/graph/graphArrow.tsx`.

### Arrow geometry
- **Straight (default)** — `from` / `to` in **Q–P space**; canvas converts with scales.
- **Curved** — `followCurveId: '<curve-id>'` bends from `from` to `to` along that curve (same spline as the curve). Used for “quantity demanded increases” along **D**.
- **Curve quantities** — With `followCurveId`, set `fromQuantity` / `toQuantity` (Q on the x-axis) instead of hand-tuned `y`; `resolveGraphArrowEndpoints` reads price from the curve via `priceAtQuantity` (Catmull–Rom, same as rendering).

### Arrow styling (textbook theme)
- **Unified shape** — One filled path (shaft + head), not separate black outline + inner spine.
- **Stroke and fill** use the same color (including `strokeGradient` for supply shift).
- **`fillOpacity`** ~0.82 on fill; stroke at full opacity (`graphThemes.textbook.arrow`).
- **`strokeGradient`** — `{ fromColorRole, toColorRole }` for blue→red supply-shift arrow.
- **`strokeColorRole`** — Solid arrows (e.g. `priceFalls`, `quantityIncreases` in `colors.callouts`).
- **`thicknessScale`** — Optional per-arrow multiplier (default 1).

### Callout boxes
- **`calloutColorRole`** — Almost always `'calloutCream'` for label background.
- **Arrow color ≠ callout fill** — Arrows are colored; boxes stay cream unless explicitly changed.
- Theme: square corners (`borderRadius: 0`), **left-aligned** text (`callout: 'book'` typography), **upper-left shadow** (`callout.shadow` offsets), no black border.

### Positioning
- Tune arrow endpoints and **`labelOffset`** in chapter config only—avoid magic numbers in `graphArrow.tsx` for one chapter.

---

## 9. Textbook theme defaults (reference)

When aligning a chapter to the textbook look:

- `graphThemeId: 'textbook'`
- `graphLayout: { equalAxisLengths: true }`
- Y-axis: `titleRotation: 0`, `titleAboveMaxTick: true`, `titleOffsetX/Y` as in `increaseInSupplyChapter.ts`
- Curve stroke width from theme (`curves.strokeWidth: 4.5`)
- Demand blue `demand` (#0066B3), supply red `supplyInitial` / `supply` (#DA2128) where pedagogy requires
- Gill Sans stack via `graphThemes/textbook.ts`

**Increase in supply** is the reference implementation for axes, `throughPoints` curves, arrows, build steps, and S₀→S₁ morph.

---

## 10. Assets

```
src/assets/chapters/<chapter-id>/book.png
src/assets/chapters/index.ts   # export { default as … } from './<chapter-id>/book.png'
```

Import in chapter config: `bookView: { imageSrc, alt }`. Prefer **`bookBuildStepId`** for interactive book parity with a build step.

---

## 11. Engine responsibilities (where logic belongs)

| Concern | Location |
|---------|----------|
| Types / chapter schema | `src/engine/types.ts` |
| Curve generation | `src/engine/curveRegistry.ts` |
| Scales, paths, equilibria resolution | `src/engine/graphEngine.ts` |
| throughPoints intersection, sampling | `src/engine/curveIntersection.ts` |
| Theme → colors/fonts | `src/engine/resolveGraphStyle.ts` + `graphThemes/` |
| Mode/layer visibility | `src/components/core/GraphCanvas.tsx` |
| Arrow paths (straight + curved) | `graphEngine.buildCurvedArrowGeometry` + `graph/graphArrow.tsx` |
| Explore surplus/shortage | `src/engine/strategies/supplyDemandStrategy.ts` |
| Elasticity explore | `src/engine/strategies/elasticityStrategy.ts` |

---

## 12. What not to do

- Do **not** add chapter-specific rendering branches in components when a config flag can describe the behavior.
- Do **not** put textbook RGB values in components—use `graphThemes` roles or `colors.callouts`.
- Do **not** swap Q and P on axes without updating `graphCoordinates` and all control points.
- Do **not** use GeoGebra/embeds for textbook figures—use config, engine SVG, or `bookView` assets.
- Do **not** commit secrets or run destructive git commands unless the user asks.
- Do **not** add tests that only assert trivial truth unless they protect real regression paths.
- Do **not** reintroduce double-layer black-outline arrows unless the theme is intentionally changed project-wide.

---

## 13. Adding a new chapter (checklist)

1. Create `src/config/<chapterName>Chapter.ts` exporting `ChapterConfig`.
2. Register in `src/config/chapterRegistry.ts`.
3. Set `graphThemeId: 'textbook'` (unless explicitly legacy).
4. Define `xAxis` / `yAxis` and curves (`throughPoints` or registry types).
5. Add `equilibria[]` and `buildSteps[]` with `visibleLayers` / guide flags.
6. Set `bookBuildStepId` to the final teaching step (or `bookView` + asset).
7. Add `curveLabels` and `graphArrows` in Q–P space; use `followCurveId` if an arrow should hug a curve.
8. Optional: `src/assets/chapters/<chapter-id>/` for static book art.
9. Run `npm run build` before considering the work done.

---

## 14. Reference chapters

| Chapter file | Role |
|--------------|------|
| `increaseInSupplyChapter.ts` | Textbook axes, throughPoints, arrows, morph S₀→S₁, callouts |
| `quantitySuppliedVsSupplyChapter.ts` | S₀/S₁/S₂ reference chart; along-curve vs shift arrows |
| `chapters.ts` | Market equilibrium, build sequence, red equilibrium, explore surplus/shortage |
| `elasticityChapter.ts` | Multiple demand curves, explore slider, textbook axes |

---

## 15. UI shell (brief)

- **`ChapterPage`** — mode state, build step index, explore control values.
- **`DisplayPanel`** — wraps `GraphCanvas` (always live graph unless `bookView` is used instead).
- **`ControlPanel`** — mode-specific copy and controls from config.
- **`ModeButtons`** — Book | Animate | Build | Explore.

App-level styling: `src/theme/`, Tailwind. Graph pedagogy styling: **`graphThemes` only**.

---

*Last aligned with codebase after textbook arrows, curved demand arrow, equilibrium chapter axes, and book/build morph behavior. Update this file when architectural decisions change.*
