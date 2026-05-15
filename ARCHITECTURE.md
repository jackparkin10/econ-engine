# Econ Engine Architecture Overview

## Purpose
This architecture transforms the existing graph demo into a reusable economics learning engine. It is driven by chapter definitions, not hardcoded graphs.

## Core Principles
- Configurable chapters replace hardcoded component logic
- Reusable graph engine handles coordinate conversion, scaling, curve generation, and equilibrium detection
- UI is a content engine with modes, not a dashboard
- Graph components render from schema definitions, not business logic
- Theme and layout are configurable per chapter

## Recommended Folder Structure

src/
  components/
    core/
      AppShell.tsx
      ChapterPage.tsx
      ControlPanel.tsx
      DisplayPanel.tsx
      GraphCanvas.tsx
      DataTable.tsx
      ModeButtons.tsx
  config/
    chapters.ts
  engine/
    curveRegistry.ts
    graphEngine.ts
    types.ts
  hooks/
    useResponsiveLayout.ts
  theme/
    engineTheme.ts

lib/
  graph/  (legacy graph helpers retained for migration)

## Core Interfaces
- `ChapterConfig`: chapter metadata, graph type, theme, axis config, curves, table layout, animation steps, build steps, explore controls
- `CurveSpec`: reusable curve layer definition with `curveType`, `params`, and presentation flags
- `BuildStep`: reusable build sequence definition
- `ExploreControl`: configuration for sliders, toggles, and sandbox inputs
- `AnimationStep`: reusable animation timeline definitions

## Reusable Graph Engine Design
- Shared axis system with dynamic scaling
- Curve registry maps `curveType` keys to generator functions
- Graph rendering composes layers from config entries
- Intersections are computed from curve params instead of component state
- Animations are driven through reusable timeline steps
- The graph canvas is responsible for drawing grid, axes, curves, annotations, and equilibrium markers

## Theme / Config System
- Chapters define a `themeColor`, axis labels, graph type, and layout
- The UI uses a centralized theme object for shadows, radius, and palette
- Display panels adapt based on `mediaType`, `showTable`, and `tablePosition`

## Example Chapter Config
See `src/config/chapters.ts` for a sample supply/demand chapter with:
- `buildSteps`
- `animationSteps`
- `exploreControls`
- responsive table + graph layout

## Example Build Mode Flow
- Build steps are defined in the chapter config
- The graph canvas shows layer visibility and equilibrium lines based on step state
- The control panel displays step guidance and visible layers

## Example Explore Mode
- Explore controls are defined as reusable `slider` or `toggle` specs
- The UI renders controls dynamically from chapter config
- The engine can apply control values to graph params and recompute values in real time

## Responsive Layout Strategy
- Use a responsive display panel that switches between single-column and split views
- Keep graphs full width on smaller screens and table/graph split on desktop
- Use a hook to derive breakpoints and layout state

## Next Steps
1. Migrate legacy graph utilities into `src/engine`
2. Wire `App.tsx` to `AppShell` and chapter configs
3. Build support for animation and explore parameter binding
4. Add new chapters through config instead of code
