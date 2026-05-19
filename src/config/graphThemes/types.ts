export type TextStyleRole = 'book' | 'bold' | 'boldItalic';

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
  };
  callout: {
    paddingX: number;
    paddingY: number;
    borderRadius: number;
    borderColor: string;
    borderWidth: number;
    textAlign: 'left' | 'center';
  };
}
