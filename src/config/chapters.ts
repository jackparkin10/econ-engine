import { ChapterConfig } from '../engine/types';
import { supplyDemandScenarios } from '../engine/strategies/supplyDemandStrategy';

export const supplyDemandChapter: ChapterConfig = {
  id: 'chapter-4-equilibrium',
  title: 'Market Equilibrium',
  description:
    'Explore supply and demand interactions through an interactive economics chapter with build, animation, and sandbox modes.',
  themeColor: '#2563eb',
  graphType: 'supply-demand',
  showTable: false,
  tablePosition: 'none',
  xAxis: {
    label: 'Quantity',
    min: 0,
    max: 10,
    ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  yAxis: {
    label: 'Price',
    min: 0,
    max: 10,
    ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  equilibriumPoint: { x: 5, y: 5 },
  curves: [
    {
      id: 'demand',
      label: 'Demand',
      curveType: 'demand',
      params: { slope: -1, intercept: 10 },
      color: '#3b82f6',
      visible: true,
      draggable: true,
      animated: true,
    },
    {
      id: 'supply',
      label: 'Supply',
      curveType: 'supply',
      params: { slope: 1, intercept: 0 },
      color: '#ef4444',
      visible: true,
      draggable: true,
      animated: true,
    },
  ],
  annotations: [
    {
      id: 'equilibrium-label',
      text: 'Equilibrium',
      x: 50,
      y: 50,
      anchor: 'middle',
    },
  ],
  buildSteps: [
    { 
      id: 'step-1', 
      title: 'Step 1: Draw the Demand Curve', 
      description: 'First, let\'s draw the demand curve. This shows the relationship between price and quantity demanded.',
      visibleLayers: ['demand'] 
    },
    { 
      id: 'step-2', 
      title: 'Step 2: Draw the Supply Curve', 
      description: 'Now, let\'s add the supply curve. This shows the relationship between price and quantity supplied.',
      visibleLayers: ['demand', 'supply'] 
    },
    { 
      id: 'step-3', 
      title: 'Step 3: Highlight the Equilibrium Point', 
      description: 'The equilibrium point is where supply and demand intersect. This is where the market clears.',
      visibleLayers: ['demand', 'supply'], 
      showEquilibrium: true 
    },
    { 
      id: 'step-4', 
      title: 'Step 4: Draw Price Line', 
      description: 'Draw a line from the equilibrium point to the Y-axis to show the equilibrium price (P).',
      visibleLayers: ['demand', 'supply'], 
      showEquilibrium: true, 
      showPriceLine: true 
    },
    { 
      id: 'step-5', 
      title: 'Step 5: Draw Quantity Line', 
      description: 'Finally, draw a line from the equilibrium point to the X-axis to show the equilibrium quantity (Q).',
      visibleLayers: ['demand', 'supply'], 
      showEquilibrium: true, 
      showPriceLine: true, 
      showQuantityLine: true 
    },
  ],
  animationSteps: [
    { id: 'animate-1', title: 'Demand enters', durationMs: 1200, layerIds: ['demand'] },
    { id: 'animate-2', title: 'Supply enters', durationMs: 1200, layerIds: ['supply'] },
    { id: 'animate-3', title: 'Equilibrium appears', durationMs: 1000, layerIds: ['equilibrium'] },
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
    { curveId: 'demand', text: 'D', x: 9, y: 1.8 },
    { curveId: 'supply', text: 'S', x: 9, y: 9.8 },
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
