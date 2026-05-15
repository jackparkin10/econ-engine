

export interface ElasticityScenarioData {
  elasticityLevel: number;
  basePrice: number;
  baseQuantity: number;
  priceChange: number; // percentage
  quantityChange: number; // percentage calculated based on elasticity
}

export const elasticityExamples: ElasticityScenarioData[] = [
  {
    elasticityLevel: 0,
    basePrice: 5,
    baseQuantity: 6,
    priceChange: 20,
    quantityChange: 0, // Perfectly inelastic - no change
  },
  {
    elasticityLevel: 1,
    basePrice: 5,
    baseQuantity: 6,
    priceChange: 20,
    quantityChange: 10, // Inelastic - smaller % change
  },
  {
    elasticityLevel: 2,
    basePrice: 5,
    baseQuantity: 6,
    priceChange: 20,
    quantityChange: 20, // Unit elastic - same % change
  },
  {
    elasticityLevel: 3,
    basePrice: 5,
    baseQuantity: 6,
    priceChange: 20,
    quantityChange: 40, // Elastic - larger % change
  },
  {
    elasticityLevel: 4,
    basePrice: 5,
    baseQuantity: 6,
    priceChange: 20,
    quantityChange: 100, // Perfectly elastic - drops to zero
  },
];

export function getElasticityScenario(
  elasticityLevel: number
): ElasticityScenarioData {
  const level = Math.max(0, Math.min(4, Math.round(elasticityLevel)));
  return elasticityExamples[level];
}

export function calculateElasticityPoint(
  scenario: ElasticityScenarioData
): { initialPoint: { q: number; p: number }; newPoint: { q: number; p: number } } {
  const priceMultiplier = 1 + scenario.priceChange / 100;
  const quantityMultiplier = 1 - scenario.quantityChange / 100;

  return {
    initialPoint: { q: scenario.baseQuantity, p: scenario.basePrice },
    newPoint: {
      q: scenario.baseQuantity * quantityMultiplier,
      p: scenario.basePrice * priceMultiplier,
    },
  };
}
