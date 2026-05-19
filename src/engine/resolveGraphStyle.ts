import { getGraphTheme } from '../config/graphThemes';
import { GraphThemeConfig, TextStyle, TextStyleRole } from '../config/graphThemes/types';
import {
  ChapterConfig,
  CurveSpec,
  EquilibriumSpec,
  GraphArrowSpec,
  GraphCalloutSpec,
  StageMode,
} from './types';

export interface ResolvedTextStyle extends TextStyle {
  fontFamily: string;
}

export interface ResolvedCurveStyle {
  id: string;
  stroke: string;
  strokeWidth: number;
  strokeLinecap: 'round' | 'butt';
  strokeDasharray?: string;
  animated?: boolean;
  spec: CurveSpec;
}

export interface ResolvedChapterGraphStyle {
  theme: GraphThemeConfig;
  layout: GraphThemeConfig['layout'];
  curves: Map<string, ResolvedCurveStyle>;
  resolveColor: (roleOrHex?: string) => string;
  textStyle: (role: TextStyleRole, fillRole?: string) => ResolvedTextStyle;
  axisTitleStyle: ResolvedTextStyle;
  tickStyle: ResolvedTextStyle;
  curveLabelStyle: ResolvedTextStyle;
  calloutStyle: ResolvedTextStyle;
}

const isHexColor = (value: string) => value.startsWith('#');

export const resolveChapterGraphStyle = (
  chapter: ChapterConfig,
  mode: StageMode = 'book'
): ResolvedChapterGraphStyle => {
  const theme = getGraphTheme(chapter.graphThemeId);
  const layout = {
    ...theme.layout,
    ...chapter.graphLayout,
    margin: {
      ...theme.layout.margin,
      ...chapter.graphLayout?.margin,
    },
    equalAxisLengths:
      chapter.graphLayout?.equalAxisLengths ?? theme.layout.equalAxisLengths ?? false,
  };

  const resolveColor = (roleOrHex?: string): string => {
    if (!roleOrHex) return theme.colors.axis;
    if (isHexColor(roleOrHex)) return roleOrHex;
    return theme.colors.roles[roleOrHex] ?? theme.colors.callouts[roleOrHex] ?? roleOrHex;
  };

  const textStyle = (role: TextStyleRole, fillRole?: string): ResolvedTextStyle => {
    const base = theme.typography.roles[role];
    const fill = fillRole ? resolveColor(fillRole) : base.fill ?? theme.colors.tick;
    return {
      fontFamily: theme.typography.fontFamily,
      fontSize: base.fontSize,
      fontWeight: base.fontWeight,
      fontStyle: base.fontStyle ?? 'normal',
      fill,
    };
  };

  const axisTitleStyle = textStyle(theme.typography.axisTitle, 'axisTitle');
  const tickStyle = textStyle(theme.typography.tick, 'tick');
  const curveLabelStyle = textStyle(theme.typography.curveLabel, 'tick');
  const calloutStyle = textStyle(theme.typography.callout, 'tick');

  const curves = new Map<string, ResolvedCurveStyle>();
  for (const curve of chapter.curves) {
    const role = curve.colorRoleByMode?.[mode] ?? curve.colorRole ?? 'demand';
    const stroke = curve.color ?? resolveColor(role);
    curves.set(curve.id, {
      id: curve.id,
      stroke,
      strokeWidth: theme.curves.strokeWidth,
      strokeLinecap: theme.curves.strokeLinecap,
      strokeDasharray: curve.strokeDasharray,
      animated: curve.animated,
      spec: curve,
    });
  }

  return {
    theme,
    layout,
    curves,
    resolveColor,
    textStyle,
    axisTitleStyle: { ...axisTitleStyle, fill: theme.colors.axisTitle },
    tickStyle: { ...tickStyle, fill: theme.colors.tick },
    curveLabelStyle,
    calloutStyle,
  };
};

export const resolveEquilibriumColor = (
  style: ResolvedChapterGraphStyle,
  spec: EquilibriumSpec
): string => {
  if (spec.color) return spec.color;
  if (spec.colorRole) return style.resolveColor(spec.colorRole);
  return style.resolveColor(style.theme.equilibrium.defaultGuideColorRole);
};

export const resolveCalloutFill = (
  style: ResolvedChapterGraphStyle,
  arrow: GraphArrowSpec | GraphCalloutSpec
): string => {
  if (arrow.calloutColor) return arrow.calloutColor;
  if (arrow.calloutColorRole) return style.resolveColor(arrow.calloutColorRole);
  return style.theme.colors.background;
};

export const resolveArrowStroke = (
  style: ResolvedChapterGraphStyle,
  arrow: GraphArrowSpec
): string => {
  if (arrow.strokeColor) return arrow.strokeColor;
  if (arrow.strokeColorRole) return style.resolveColor(arrow.strokeColorRole);
  return style.resolveColor('demand');
};

export type TickFormat = 'integer' | 'decimal-2' | 'auto';

export const formatAxisTick = (value: number, format?: TickFormat): string => {
  if (format === 'integer') return value.toFixed(0);
  if (format === 'decimal-2') {
    if (Number.isInteger(value)) return value.toFixed(2);
    return value.toFixed(2);
  }
  if (Number.isInteger(value)) return value.toFixed(0);
  return value.toFixed(2);
};
