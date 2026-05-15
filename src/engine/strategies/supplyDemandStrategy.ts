import { ChapterConfig, CurveSpec, ExploreScenario } from '../types';

export const supplyDemandScenarios: ExploreScenario[] = [
  {
    id: 'surplus',
    label: 'Surplus',
    description: 'Quantity supplied exceeds quantity demanded',
    pricePoint: 8,
    calculateQd: (p: number, demandCurve: CurveSpec) => {
      const m = demandCurve.params.slope ?? -1;
      const b = demandCurve.params.intercept ?? 0;
      return (p - b) / m;
    },
    calculateQs: (p: number, supplyCurve: CurveSpec) => {
      const m = supplyCurve.params.slope ?? 1;
      const b = supplyCurve.params.intercept ?? 0;
      return (p - b) / m;
    },
  },
  {
    id: 'shortage',
    label: 'Shortage',
    description: 'Quantity demanded exceeds quantity supplied',
    pricePoint: 2,
    calculateQd: (p: number, demandCurve: CurveSpec) => {
      const m = demandCurve.params.slope ?? -1;
      const b = demandCurve.params.intercept ?? 0;
      return (p - b) / m;
    },
    calculateQs: (p: number, supplyCurve: CurveSpec) => {
      const m = supplyCurve.params.slope ?? 1;
      const b = supplyCurve.params.intercept ?? 0;
      return (p - b) / m;
    },
  },
];

export function renderExploreIllustration(
  scenario: ExploreScenario,
  chapter: ChapterConfig
): { price: number; supply: { x: number; y: number }; demand: { x: number; y: number } } | null {
  if (!scenario.pricePoint || !scenario.calculateQd || !scenario.calculateQs) return null;

  const supplyCurve = chapter.curves.find((curve) => curve.curveType === 'supply');
  const demandCurve = chapter.curves.find((curve) => curve.curveType === 'demand');
  if (!supplyCurve || !demandCurve) return null;

  const price = scenario.pricePoint;
  const supplyX = scenario.calculateQs(price, supplyCurve);
  const demandX = scenario.calculateQd(price, demandCurve);

  return {
    price,
    supply: { x: supplyX, y: price },
    demand: { x: demandX, y: price },
  };
}
