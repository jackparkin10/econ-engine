export type TextStyleRole = 'book' | 'axisTick' | 'bold' | 'italic' | 'boldItalic';

export interface TextStyle {
  fontSize: number;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  fill: string;
}

export interface GraphThemeConfig {
  id: string;
  layout: {
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
    background: string;
    borderRadius: number;
    /** When true, x- and y-axis lines use the same pixel length (square plot area). */
    equalAxisLengths?: boolean;
  };
  typography: {
    fontFamily: string;
    roles: Record<TextStyleRole, Omit<TextStyle, 'fill'> & { fill?: string }>;
    axisTitle: TextStyleRole;
    tick: TextStyleRole;
    curveLabel: TextStyleRole;
    callout: TextStyleRole;
  };
  colors: {
    axis: string;
    tick: string;
    axisTitle: string;
    background: string;
    roles: Record<string, string>;
    callouts: Record<string, string>;
  };
  curves: {
    strokeWidth: number;
    strokeLinecap: 'round' | 'butt';
  };
  equilibrium: {
    showPoints: boolean;
    pointRadius: number;
    pointFill: string;
    pointStroke: string;
    pointStrokeWidth: number;
    guideStrokeWidth: number;
    guideDasharray: string;
    defaultGuideColorRole: string;
  };
  arrow: {
    outlineColor: string;
    outlineWidth: number;
    shaftWidth: number;
    headLength: number;
    headWidth: number;
    /** Unified arrow body fill (0–1). Stroke uses full opacity. */
    fillOpacity?: number;
    borderWidth?: number;
  };
  callout: {
    paddingX: number;
    /** Per-side overrides; default to paddingX / paddingY when omitted. */
    paddingLeft?: number;
    paddingRight?: number;
    paddingY: number;
    paddingTop?: number;
    paddingBottom?: number;
    /** Unitless multiplier on callout font size (e.g. 1.2). */
    lineHeight?: number;
    borderRadius: number;
    borderColor: string;
    borderWidth: number;
    /** Offset shadow layer up/left behind the box (light from upper-left). */
    shadow?: {
      offsetX: number;
      offsetY: number;
      color: string;
    };
    textAlign: 'left' | 'center';
    /** Thin line from callout edge (toward arrow mid) to arrow outline; drawn beneath arrows and box. */
    connector?: {
      stroke: string;
      strokeWidth: number;
    };
  };
}
