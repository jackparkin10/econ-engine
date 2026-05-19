import { GraphThemeConfig } from './types';

/** Colors and typography from textbook specs (Gill Sans MT Pro, RGB swatches). */
export const textbookGraphTheme: GraphThemeConfig = {
  id: 'textbook',
  layout: {
    width: 760,
    height: 480,
    margin: { top: 28, right: 36, bottom: 72, left: 72 },
    background: '#ffffff',
    borderRadius: 0,
  },
  typography: {
    fontFamily: '"Gill Sans MT Pro", "Gill Sans MT", "Gill Sans", "Calibri", sans-serif',
    roles: {
      book: { fontSize: 13, fontWeight: 400, fontStyle: 'normal' },
      bold: { fontSize: 13, fontWeight: 700, fontStyle: 'normal' },
      boldItalic: { fontSize: 13, fontWeight: 700, fontStyle: 'italic' },
    },
    axisTitle: 'bold',
    tick: 'book',
    curveLabel: 'bold',
    callout: 'bold',
  },
  colors: {
    axis: '#000000',
    tick: '#000000',
    axisTitle: '#000000',
    background: '#ffffff',
    roles: {
      demand: '#0066B3',
      supply: '#DA2128',
      supplyInitial: '#DA2128',
      supplyNew: '#0066B3',
      equilibrium: '#000000',
      explore: '#0066B3',
      curveRed: '#DA2128',
      curveOrange: '#E86A2E',
      curveBlue: '#0066B3',
      curveGreen: '#3D8B5F',
      curveViolet: '#6B4C9A',
    },
    callouts: {
      /** Cream callout box fill (RGB 255, 239, 207) */
      calloutCream: '#FFEFCF',
      supplyIncreases: '#BADAF3',
      priceFalls: '#FFEFCF',
      quantityIncreases: '#C4E2CA',
      quantityDemandedIncreases: '#EBC6DE',
    },
  },
  curves: {
    strokeWidth: 4.5,
    strokeLinecap: 'round',
  },
  equilibrium: {
    showPoints: true,
    pointRadius: 5,
    pointFill: '#000000',
    pointStroke: '#ffffff',
    pointStrokeWidth: 1.5,
    guideStrokeWidth: 1.5,
    guideDasharray: '5 4',
    defaultGuideColorRole: 'equilibrium',
  },
  arrow: {
    outlineColor: '#1a1a1a',
    outlineWidth: 3,
    shaftWidth: 2,
    headLength: 11,
    headWidth: 9,
  },
  callout: {
    paddingX: 8,
    paddingY: 5,
    borderRadius: 0,
    borderColor: '#1a1a1a',
    borderWidth: 1,
    textAlign: 'left',
  },
};
