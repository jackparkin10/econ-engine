import { pointOnCurveAtPrice } from '../curveIntersection';
import { ChapterConfig, CurveSpec, ExploreScenario } from '../types';

export const supplyDemandScenarios: ExploreScenario[] = [
  {
    id: 'surplus',
    label: 'Surplus',
    description: 'Quantity supplied exceeds quantity demanded',
    pricePoint: 1.4,
    calculateQd: (p: number, demandCurve: CurveSpec) => pointOnCurve(demandCurve, p)?.x ?? 0,
    calculateQs: (p: number, supplyCurve: CurveSpec) => pointOnCurve(supplyCurve, p)?.x ?? 0,
  },
  {
    id: 'shortage',
    label: 'Shortage',
    description: 'Quantity demanded exceeds quantity supplied',
    pricePoint: 0.65,
    calculateQd: (p: number, demandCurve: CurveSpec) => pointOnCurve(demandCurve, p)?.x ?? 0,
    calculateQs: (p: number, supplyCurve: CurveSpec) => pointOnCurve(supplyCurve, p)?.x ?? 0,
  },
];

const pointOnCurve = (
  curve: CurveSpec,
  price: number
): { x: number; y: number } | null => {
  if (curve.curveType === 'throughPoints' && curve.params.points?.length) {
    return pointOnCurveAtPrice(curve.params.points, price);
  }
  const m = curve.params.slope;
  if (m === undefined || m === 0) return null;
  const b = curve.params.intercept ?? 0;
  const x = (price - b) / m;
  return { x, y: price };
};

const findDemandCurve = (chapter: ChapterConfig) =>
  chapter.curves.find((curve) => curve.id === 'demand');

const findSupplyCurve = (chapter: ChapterConfig) =>
  chapter.curves.find((curve) => curve.id === 'supply-initial' || curve.id === 'supply');

export function renderExploreIllustration(
  scenario: ExploreScenario,
  chapter: ChapterConfig
): { price: number; supply: { x: number; y: number }; demand: { x: number; y: number } } | null {
  if (!scenario.pricePoint || !scenario.calculateQd || !scenario.calculateQs) return null;

  const supplyCurve = findSupplyCurve(chapter);
  const demandCurve = findDemandCurve(chapter);
  if (!supplyCurve || !demandCurve) return null;

  const price = scenario.pricePoint;
  const supplyPoint = pointOnCurve(supplyCurve, price);
  const demandPoint = pointOnCurve(demandCurve, price);
  if (!supplyPoint || !demandPoint) return null;

  return {
    price,
    supply: supplyPoint,
    demand: demandPoint,
  };
}
