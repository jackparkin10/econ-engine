import { line, curveCatmullRom, curveLinear } from 'd3-shape';
import { scaleLinear, type ScaleLinear } from 'd3-scale';
import { AxisConfig, ChapterConfig, CurveSpec } from './types';
import { generateEconomicCurvePoints, toPlotPoint } from './graphCoordinates';
import { findThroughPointsIntersection, insertEquilibriumKnots } from './curveIntersection';

export { insertEquilibriumKnots };

export interface CoordinateScale {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export const createScales = (xAxis: AxisConfig, yAxis: AxisConfig, width: number, height: number): CoordinateScale => {
  const xScale = scaleLinear().domain([xAxis.min, xAxis.max]).range([0, width]);
  const yScale = scaleLinear().domain([yAxis.min, yAxis.max]).range([height, 0]);
  return { xScale, yScale };
};

export const curvePath = (curve: CurveSpec, chapter: ChapterConfig, scales: CoordinateScale) => {
  const economicPoints = generateEconomicCurvePoints(curve, chapter);
  const plotPoints = economicPoints.map(([quantity, price]) => {
    const [x, y] = toPlotPoint(quantity, price, chapter);
    return [scales.xScale(x), scales.yScale(y)] as [number, number];
  });

  const pathGenerator = line<[number, number]>()
    .x(([x]) => x)
    .y(([, y]) => y)
    .curve(curve.curveType === 'throughPoints' ? curveCatmullRom.alpha(0.75) : curveLinear);

  return pathGenerator(plotPoints) || '';
};

export const resolveCurveVisibility = (config: ChapterConfig): CurveSpec[] => {
  if (!config.buildSteps) return config.curves;
  return config.curves.map((curve) => ({ ...curve, visible: true }));
};

export interface EquilibriumPoint {
  x: number;
  y: number;
}

export const findEquilibriumBetween = (
  demandCurve: CurveSpec,
  supplyCurve: CurveSpec,
  chapter?: ChapterConfig
): EquilibriumPoint | null => {
  const economic =
    demandCurve.curveType === 'throughPoints' || supplyCurve.curveType === 'throughPoints'
      ? findThroughPointsIntersection(demandCurve, supplyCurve)
      : (() => {
          const mS = supplyCurve.params.slope ?? 1;
          const bS = supplyCurve.params.intercept ?? 0;
          const mD = demandCurve.params.slope ?? -1;
          const bD = demandCurve.params.intercept ?? 0;
          if (mS === mD) return null;
          const quantity = (bD - bS) / (mS - mD);
          const price = mS * quantity + bS;
          return { x: quantity, y: price };
        })();

  if (!economic) return null;

  if (chapter) {
    const [x, y] = toPlotPoint(economic.x, economic.y, chapter);
    return { x, y };
  }

  return { x: economic.x, y: economic.y };
};

export const findEquilibrium = (
  curves: CurveSpec[],
  chapter?: ChapterConfig
): EquilibriumPoint | null => {
  const supplyCurve = curves.find((curve) => curve.curveType === 'supply');
  const demandCurve = curves.find((curve) => curve.curveType === 'demand');
  if (!supplyCurve || !demandCurve) return null;
  return findEquilibriumBetween(demandCurve, supplyCurve, chapter);
};

export const applyExploreBindings = (
  chapter: ChapterConfig,
  curves: CurveSpec[],
  exploreValues?: Record<string, number | boolean>
): CurveSpec[] => {
  if (!chapter.exploreBindings?.length || !exploreValues) return curves;

  return curves.map((curve) => {
    const binding = chapter.exploreBindings?.find((entry) => entry.curveId === curve.id);
    if (!binding) return curve;

    const value = exploreValues[binding.targetKey];
    if (typeof value !== 'number') return curve;

    return {
      ...curve,
      params: { ...curve.params, [binding.param]: value },
    };
  });
};

export interface ResolvedEquilibrium {
  id: string;
  point: EquilibriumPoint;
  color: string;
  label?: string;
}

export const resolveEquilibria = (
  chapter: ChapterConfig,
  curves: CurveSpec[],
  equilibriumIds?: string[]
): ResolvedEquilibrium[] => {
  if (!chapter.equilibria?.length) return [];

  const ids = equilibriumIds ?? chapter.equilibria.map((entry) => entry.id);
  const curveById = new Map(curves.map((curve) => [curve.id, curve]));

  const resolved: ResolvedEquilibrium[] = [];

  for (const spec of chapter.equilibria) {
    if (!ids.includes(spec.id)) continue;

    const demand = curveById.get(spec.demandCurveId);
    const supply = curveById.get(spec.supplyCurveId);
    if (!demand || !supply) continue;

    const point = findEquilibriumBetween(demand, supply, chapter);
    if (!point) continue;

    resolved.push({
      id: spec.id,
      point,
      color: spec.color ?? chapter.themeColor,
      label: spec.label,
    });
  }

  return resolved;
};
