import { line, curveCatmullRom, curveLinear } from 'd3-shape';
import { scaleLinear, type ScaleLinear } from 'd3-scale';
import { AxisConfig, ChapterConfig, CurvePoint, CurveSpec, GraphPoint } from './types';
import { generateEconomicCurvePoints, toPlotPoint } from './graphCoordinates';
import { findThroughPointsIntersection, insertEquilibriumKnots, sampleCatmullRom } from './curveIntersection';

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

export const interpolateCurvePoints = (
  from: CurvePoint[],
  to: CurvePoint[],
  t: number
): CurvePoint[] => {
  const count = Math.min(from.length, to.length);
  return Array.from({ length: count }, (_, index) => ({
    x: from[index].x + t * (to[index].x - from[index].x),
    y: from[index].y + t * (to[index].y - from[index].y),
  }));
};

export interface CurvedArrowGeometry {
  shaftPath: string;
  headFrom: GraphPoint;
  headTo: GraphPoint;
}

const closestPointIndex = <T extends { x: number; y: number }>(points: T[], target: GraphPoint) => {
  let index = 0;
  let best = Infinity;
  for (let i = 0; i < points.length; i++) {
    const distance = (points[i].x - target.x) ** 2 + (points[i].y - target.y) ** 2;
    if (distance < best) {
      best = distance;
      index = i;
    }
  }
  return index;
};

/** Pixel samples along the same path `curvePath` draws (d3 Catmull–Rom for throughPoints). */
const sampleCurvePixelPath = (
  curve: CurveSpec,
  chapter: ChapterConfig,
  scales: CoordinateScale,
  stepsPerBezier = 10
): Array<[number, number]> => {
  const economicPoints = generateEconomicCurvePoints(curve, chapter);
  const knots = economicPoints.map(([quantity, price]) => {
    const [plotX, plotY] = toPlotPoint(quantity, price, chapter);
    return [scales.xScale(plotX), scales.yScale(plotY)] as [number, number];
  });

  if (knots.length < 2) return knots;

  const points: Array<[number, number]> = [];
  let current: [number, number] | null = null;

  const context = {
    moveTo(x: number, y: number) {
      current = [x, y];
      points.push([x, y]);
    },
    lineTo(x: number, y: number) {
      if (current) {
        for (let step = 1; step <= 4; step++) {
          const t = step / 4;
          points.push([
            current[0] + t * (x - current[0]),
            current[1] + t * (y - current[1]),
          ]);
        }
      }
      current = [x, y];
      points.push([x, y]);
    },
    bezierCurveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number) {
      if (!current) return;
      const p0 = current;
      const p1: [number, number] = [x1, y1];
      const p2: [number, number] = [x2, y2];
      const p3: [number, number] = [x, y];
      for (let step = 1; step <= stepsPerBezier; step++) {
        const t = step / stepsPerBezier;
        const mt = 1 - t;
        points.push([
          mt ** 3 * p0[0] + 3 * mt ** 2 * t * p1[0] + 3 * mt * t ** 2 * p2[0] + t ** 3 * p3[0],
          mt ** 3 * p0[1] + 3 * mt ** 2 * t * p1[1] + 3 * mt * t ** 2 * p2[1] + t ** 3 * p3[1],
        ]);
      }
      current = [x, y];
    },
    closePath() {},
  };

  const pathGenerator = line<[number, number]>()
    .x(([x]) => x)
    .y(([, y]) => y)
    .curve(curve.curveType === 'throughPoints' ? curveCatmullRom.alpha(0.75) : curveLinear)
    .context(context as unknown as CanvasRenderingContext2D);

  pathGenerator(knots);
  return points;
};

const sampleCurveEconomicPoints = (curve: CurveSpec, chapter: ChapterConfig): Array<[number, number]> => {
  if (curve.curveType === 'throughPoints' && curve.params.points?.length) {
    return sampleCatmullRom(
      curve.params.points.map((point) => ({ x: point.x, y: point.y })),
      48
    ).map((point) => [point.x, point.y] as [number, number]);
  }
  return generateEconomicCurvePoints(curve, chapter, 80);
};

const toPixelPoints = (
  segment: Array<[number, number]>,
  chapter: ChapterConfig,
  scales: CoordinateScale
): Array<[number, number]> =>
  segment.map(([quantity, price]) => {
    const [plotX, plotY] = toPlotPoint(quantity, price, chapter);
    return [scales.xScale(plotX), scales.yScale(plotY)] as [number, number];
  });

const buildShaftFromPixelPoints = (pixelPoints: Array<[number, number]>): CurvedArrowGeometry | null => {
  if (pixelPoints.length < 2) return null;

  const pathGenerator = line<[number, number]>()
    .x(([x]) => x)
    .y(([, y]) => y)
    .curve(curveLinear);

  const shaftPath = pathGenerator(pixelPoints) ?? '';
  const last = pixelPoints[pixelPoints.length - 1];
  const prev = pixelPoints[pixelPoints.length - 2];

  return {
    shaftPath,
    headFrom: { x: prev[0], y: prev[1] },
    headTo: { x: last[0], y: last[1] },
  };
};

export const buildCurvedArrowGeometry = (
  chapter: ChapterConfig,
  curveId: string,
  from: GraphPoint,
  to: GraphPoint,
  scales: CoordinateScale,
  curves: CurveSpec[] = chapter.curves
): CurvedArrowGeometry | null => {
  const curve = curves.find((entry) => entry.id === curveId);
  if (!curve) return null;

  const pixelPath =
    curve.curveType === 'throughPoints'
      ? sampleCurvePixelPath(curve, chapter, scales)
      : toPixelPoints(sampleCurveEconomicPoints(curve, chapter), chapter, scales);

  if (pixelPath.length < 2) return null;

  const fromPlot = toPlotPoint(from.x, from.y, chapter);
  const toPlot = toPlotPoint(to.x, to.y, chapter);
  const fromPx = { x: scales.xScale(fromPlot[0]), y: scales.yScale(fromPlot[1]) };
  const toPx = { x: scales.xScale(toPlot[0]), y: scales.yScale(toPlot[1]) };

  const fromIdx = closestPointIndex(
    pixelPath.map(([x, y]) => ({ x, y })),
    fromPx
  );
  const toIdx = closestPointIndex(
    pixelPath.map(([x, y]) => ({ x, y })),
    toPx
  );
  let segment =
    fromIdx <= toIdx ? pixelPath.slice(fromIdx, toIdx + 1) : pixelPath.slice(toIdx, fromIdx + 1).reverse();

  if (segment.length < 2) {
    segment = [
      [fromPx.x, fromPx.y],
      [toPx.x, toPx.y],
    ];
  } else {
    segment[0] = [fromPx.x, fromPx.y];
    segment[segment.length - 1] = [toPx.x, toPx.y];
  }

  return buildShaftFromPixelPoints(segment);
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
