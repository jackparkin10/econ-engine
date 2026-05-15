import { line, curveLinear } from 'd3-shape';
import { scaleLinear, type ScaleLinear } from 'd3-scale';
import { AxisConfig, ChapterConfig, CurveSpec } from './types';
import { curveRegistry } from './curveRegistry';

export interface CoordinateScale {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export const createScales = (xAxis: AxisConfig, yAxis: AxisConfig, width: number, height: number): CoordinateScale => {
  const xScale = scaleLinear().domain([xAxis.min, xAxis.max]).range([0, width]);
  const yScale = scaleLinear().domain([yAxis.min, yAxis.max]).range([height, 0]);
  return { xScale, yScale };
};

export const curvePath = (curve: CurveSpec, xDomain: [number, number], scales: CoordinateScale) => {
  const generator = curveRegistry[curve.curveType] || curveRegistry.linear;
  const points = generator.generate(curve.params, xDomain);
  const pathGenerator = line<[number, number]>()
    .x(([x]) => scales.xScale(x))
    .y(([, y]) => scales.yScale(y))
    .curve(curveLinear);

  return pathGenerator(points) || '';
};

export const resolveCurveVisibility = (config: ChapterConfig): CurveSpec[] => {
  if (!config.buildSteps) return config.curves;
  return config.curves.map((curve) => ({ ...curve, visible: true }));
};

export interface EquilibriumPoint {
  x: number;
  y: number;
}

export const findEquilibrium = (curves: CurveSpec[]): EquilibriumPoint | null => {
  const supplyCurve = curves.find((curve) => curve.curveType === 'supply');
  const demandCurve = curves.find((curve) => curve.curveType === 'demand');
  if (!supplyCurve || !demandCurve) return null;

  const mS = supplyCurve.params.slope ?? 1;
  const bS = supplyCurve.params.intercept ?? 0;
  const mD = demandCurve.params.slope ?? -1;
  const bD = demandCurve.params.intercept ?? 0;

  if (mS === mD) return null;

  const x = (bD - bS) / (mS - mD);
  const y = mS * x + bS;
  return { x, y };
};
