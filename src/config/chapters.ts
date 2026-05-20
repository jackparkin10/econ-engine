import { ChapterConfig } from '../engine/types';
import { supplyDemandScenarios } from '../engine/strategies/supplyDemandStrategy';

export const supplyDemandChapter: ChapterConfig = {
  id: 'chapter-4-equilibrium',
  title: 'Market Equilibrium',
  description:
    'Explore supply and demand interactions through an interactive economics chapter with build, animation, and sandbox modes.',
  themeColor: '#0066B3',
  graphThemeId: 'textbook',
  graphLayout: { equalAxisLengths: true },
  graphType: 'supply-demand',
  bookBuildStepId: 'step-6',
  showTable: false,
  tablePosition: 'none',
  xAxis: {
    label: 'Quantity (millions of bottles per day)',
    min: 7,
    max: 13,
    ticks: [7, 8, 9, 10, 11, 12, 13],
    tickFormat: 'integer',
  },
  yAxis: {
    label: 'Price (dollars per bottle)',
    min: 0,
    max: 2,
    ticks: [0, 0.5, 1, 1.5, 2],
    tickFormat: 'decimal-2',
    titleRotation: 0,
    titleAboveMaxTick: true,
    titleOffsetX: -8,
    titleOffsetY: -14,
  },
  equilibria: [
    {
      id: 'equilibrium',
      demandCurveId: 'demand',
      supplyCurveId: 'supply-initial',
      colorRole: 'supplyInitial',
    },
  ],
  exploreLayers: ['demand', 'supply-initial'],
  curves: [
    {
      id: 'demand',
      label: 'Demand',
      curveType: 'throughPoints',
      params: {
        points: [
          { x: 8.5, y: 1.85 },
          { x: 10, y: 1 },
          { x: 11, y: 0.75 },
          { x: 12.3, y: 0.52 },
        ],
      },
      colorRole: 'demand',
      visible: false,
      animated: true,
    },
    {
      id: 'supply-initial',
      label: 'Supply',
      curveType: 'throughPoints',
      params: {
        points: [
          { x: 9, y: 0.75 },
          { x: 10, y: 1 },
          { x: 11.5, y: 1.8 },
        ],
      },
      colorRole: 'demand',
      visible: false,
      animated: true,
    },
  ],
  buildSteps: [
    {
      id: 'step-1',
      title: 'Step 1: Prepare the graph',
      description: 'Start with the axes only. Click Next when you are ready to draw the demand curve.',
      visibleLayers: [],
    },
    {
      id: 'step-2',
      title: 'Step 2: Draw the Demand Curve',
      description:
        'Draw the demand curve. This shows the relationship between price and quantity demanded.',
      visibleLayers: ['demand'],
    },
    {
      id: 'step-3',
      title: 'Step 3: Draw the Supply Curve',
      description:
        'Add the supply curve. This shows the relationship between price and quantity supplied.',
      visibleLayers: ['demand', 'supply-initial'],
    },
    {
      id: 'step-4',
      title: 'Step 4: Highlight the Equilibrium Point',
      description: 'The equilibrium point is where supply and demand intersect. This is where the market clears.',
      visibleLayers: ['demand', 'supply-initial'],
      showEquilibrium: true,
      visibleEquilibria: ['equilibrium'],
    },
    {
      id: 'step-5',
      title: 'Step 5: Draw Price Line',
      description: 'Draw a line from the equilibrium point to the Y-axis to show the equilibrium price (P).',
      visibleLayers: ['demand', 'supply-initial'],
      showEquilibrium: true,
      visibleEquilibria: ['equilibrium'],
      showPriceLine: true,
    },
    {
      id: 'step-6',
      title: 'Step 6: Draw Quantity Line',
      description:
        'Draw a line from the equilibrium point to the X-axis to show the equilibrium quantity (Q).',
      visibleLayers: ['demand', 'supply-initial'],
      showEquilibrium: true,
      visibleEquilibria: ['equilibrium'],
      showPriceLine: true,
      showQuantityLine: true,
    },
  ],
  animationSteps: [
    { id: 'animate-1', title: 'Demand enters', durationMs: 1200, layerIds: ['demand'] },
    { id: 'animate-2', title: 'Supply enters', durationMs: 1200, layerIds: ['supply-initial'] },
    { id: 'animate-3', title: 'Equilibrium appears', durationMs: 1000, layerIds: ['demand', 'supply-initial'] },
  ],
  exploreControls: [
    {
      id: 'surplus',
      label: 'Surplus',
      type: 'button',
      defaultValue: false,
      targetKey: 'surplus',
    },
    {
      id: 'shortage',
      label: 'Shortage',
      type: 'button',
      defaultValue: false,
      targetKey: 'shortage',
    },
  ],
  exploreScenarios: supplyDemandScenarios,
  curveLabels: [
    { curveId: 'demand', text: 'D', x: 12.3, y: 0.52, anchor: 'start', offsetX: 0.22 },
    { curveId: 'supply-initial', text: 'S', x: 11.5, y: 1.75, anchor: 'start', offsetX: 0.22 },
  ],
  modeContent: {
    book: 'Explore supply and demand interactions through an interactive economics chapter with build, animation, and sandbox modes.',
  },
  dataRows: [
    { value: 10, demand: 80, supply: 20 },
    { value: 50, demand: 50, supply: 50 },
    { value: 90, demand: 20, supply: 80 },
  ],
};
