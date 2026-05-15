# Econ Engine

A production-grade, reusable graph engine for rendering interactive economics models using React, TypeScript, SVG, D3 (for math/scales only), and Tailwind CSS.

## Features

- **Supply & Demand Curves**: Linear and curved support
- **Equilibrium Calculation**: Dynamic intersection detection
- **Surplus/Shortage Shading**: Visual area calculations
- **Interactive Dragging**: Live updates with smooth animations
- **Responsive Design**: Scales with container size
- **Configuration-Driven**: Everything controlled by props/config objects
- **Theme System**: Centralized colors, spacing, and styling

## Architecture

- **Graph Engine** (`/lib/graph`): Pure functions for scaling, curves, intersections
- **React Components** (`/components/graphs`): Modular, reusable UI components
- **Interaction Hooks**: Custom hooks for drag, state management
- **Theme System**: Centralized styling with Tailwind

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## Build

```bash
npm run build
npm run preview
```

## Supported Graph Types

- Supply/Demand with equilibrium
- Price floors and ceilings
- Surplus and shortage visualization
- Elasticity demonstrations

## Development

- No DOM manipulation with D3
- SVG rendering for crisp graphics
- TypeScript for type safety
- Tailwind for utility-first styling