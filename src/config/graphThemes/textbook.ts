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
      axisTick: { fontSize: 14, fontWeight: 400, fontStyle: 'normal' },
      bold: { fontSize: 14, fontWeight: 700, fontStyle: 'normal' },
      italic: { fontSize: 13, fontWeight: 400, fontStyle: 'italic' },
      boldItalic: { fontSize: 14, fontWeight: 700, fontStyle: 'italic' },
    },
    axisTitle: 'bold',
    tick: 'axisTick',
    curveLabel: 'boldItalic',
    callout: 'book',
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
      /** RGB 196, 226, 202 */
      quantityIncreases: '#C4E2CA',
      /** RGB 235, 198, 222 */
      priceFalls: '#EBC6DE',
      /** RGB 186, 218, 243 */
      quantityDemandedIncreases: '#BADAF3',
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
    outlineWidth: 14.5,
    shaftWidth: 3,
    headLength: 18,
    headWidth: 27.3,
    fillOpacity: 1,
    borderWidth: 0.6,
  },
  callout: {
    paddingX: 1,
    paddingY: 1,
    paddingLeft: 1.25,
    paddingRight: 0.2,
    paddingBottom: 1.25,
    lineHeight: 1.2,
    borderRadius: 0,
    borderColor: '#1a1a1a',
    borderWidth: 0,
    shadow: {
      offsetX: 1.5,
      offsetY: 1.5,
      color: '#A8A8A8',
    },
    textAlign: 'left',
    connector: {
      stroke: '#000000',
      strokeWidth: 0.975,
    },
  },
};
