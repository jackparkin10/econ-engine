import { ChapterConfig, CurveParams, CurveSpec, GraphCoordinatesConfig } from './types';
import { curveRegistry } from './curveRegistry';

export const DEFAULT_GRAPH_COORDINATES: GraphCoordinatesConfig = {
  x: 'quantity',
  y: 'price',
};

export const getGraphCoordinates = (chapter: ChapterConfig): GraphCoordinatesConfig =>
  chapter.graphCoordinates ?? DEFAULT_GRAPH_COORDINATES;

export const getPriceDomain = (chapter: ChapterConfig): [number, number] => {
  const coords = getGraphCoordinates(chapter);
  const axis = coords.x === 'price' ? chapter.xAxis : chapter.yAxis;
  return [axis.min, axis.max];
};

export const getQuantityDomain = (chapter: ChapterConfig): [number, number] => {
  const coords = getGraphCoordinates(chapter);
  const axis = coords.x === 'quantity' ? chapter.xAxis : chapter.yAxis;
  return [axis.min, axis.max];
};

/** Economic space: Q (quantity), P (price). */
export const toPlotPoint = (quantity: number, price: number, chapter: ChapterConfig): [number, number] => {
  const coords = getGraphCoordinates(chapter);
  if (coords.x === 'quantity' && coords.y === 'price') return [quantity, price];
  if (coords.x === 'price' && coords.y === 'quantity') return [price, quantity];
  return [quantity, price];
};

export const plotToEconomic = (
  plotX: number,
  plotY: number,
  chapter: ChapterConfig
): { quantity: number; price: number } => {
  const coords = getGraphCoordinates(chapter);
  if (coords.x === 'quantity' && coords.y === 'price') {
    return { quantity: plotX, price: plotY };
  }
  return { quantity: plotY, price: plotX };
};

const samplePriceDomain = (
  params: CurveParams,
  priceDomain: [number, number],
  samples = 60
): Array<[number, number]> => {
  const slope = params.slope ?? 1;
  const intercept = params.intercept ?? 0;
  const [pMin, pMax] = priceDomain;
  const step = samples > 1 ? (pMax - pMin) / (samples - 1) : 0;

  return Array.from({ length: samples }, (_, index) => {
    const price = pMin + step * index;
    const quantity = slope === 0 ? 0 : (price - intercept) / slope;
    return [quantity, price] as [number, number];
  });
};

/** Returns [Q, P] pairs in economic space. */
export const generateEconomicCurvePoints = (
  curve: CurveSpec,
  chapter: ChapterConfig,
  samples = 60
): Array<[number, number]> => {
  const coords = getGraphCoordinates(chapter);

  if (coords.x === 'price') {
    return samplePriceDomain(curve.params, getPriceDomain(chapter), samples);
  }

  const generator = curveRegistry[curve.curveType] || curveRegistry.linear;
  return generator.generate(curve.params, getQuantityDomain(chapter), samples);
};

export const findEquilibriumEconomic = (
  demandCurve: CurveSpec,
  supplyCurve: CurveSpec
): { quantity: number; price: number } | null => {
  const mS = supplyCurve.params.slope ?? 1;
  const bS = supplyCurve.params.intercept ?? 0;
  const mD = demandCurve.params.slope ?? -1;
  const bD = demandCurve.params.intercept ?? 0;

  if (mS === mD) return null;

  const quantity = (bD - bS) / (mS - mD);
  const price = mS * quantity + bS;
  return { quantity, price };
};
