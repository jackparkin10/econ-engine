import { GraphThemeConfig } from './types';

/** Previous app styling — available if a chapter opts out of textbook look. */
export const legacyGraphTheme: GraphThemeConfig = {
  id: 'legacy',
  layout: {
    width: 760,
    height: 420,
    margin: { top: 20, right: 20, bottom: 60, left: 60 },
    background: '#ffffff',
    borderRadius: 28,
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    roles: {
      book: { fontSize: 12, fontWeight: 500, fontStyle: 'normal' },
      bold: { fontSize: 14, fontWeight: 700, fontStyle: 'normal' },
      boldItalic: { fontSize: 14, fontWeight: 700, fontStyle: 'italic' },
    },
    axisTitle: 'bold',
    tick: 'book',
    curveLabel: 'bold',
    callout: 'bold',
  },
  colors: {
    axis: '#334155',
    tick: '#475569',
    axisTitle: '#475569',
    background: '#ffffff',
    roles: {
      demand: '#3b82f6',
      supply: '#ef4444',
      supplyInitial: '#ef4444',
      supplyNew: '#10b981',
      equilibrium: '#2563eb',
      explore: '#0f172a',
    },
    callouts: {
      supplyIncreases: '#dbeafe',
      priceFalls: '#fef3c7',
      quantityIncreases: '#d1fae5',
      quantityDemandedIncreases: '#fce7f3',
    },
  },
  curves: {
    strokeWidth: 3,
    strokeLinecap: 'round',
  },
  equilibrium: {
    showPoints: true,
    pointRadius: 8,
    pointFill: '#000000',
    pointStroke: '#ffffff',
    pointStrokeWidth: 1.5,
    guideStrokeWidth: 2,
    guideDasharray: '6 6',
    defaultGuideColorRole: 'equilibrium',
  },
  arrow: {
    outlineColor: '#0f172a',
    outlineWidth: 2.5,
    shaftWidth: 1.5,
    headLength: 10,
    headWidth: 8,
  },
  callout: {
    paddingX: 6,
    paddingY: 4,
    borderRadius: 6,
    borderColor: '#334155',
    borderWidth: 1,
    textAlign: 'center',
  },
};
