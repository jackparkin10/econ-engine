import { CurveParams } from './types';
import { scaleLinear } from 'd3-scale';

export interface CurveGenerator {
  id: string;
  label: string;
  generate: (params: CurveParams, xDomain: [number, number], samples?: number) => Array<[number, number]>;
}

const linear = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  const { slope = 1, intercept = 0 } = params;
  const [min, max] = xDomain;
  const step = (max - min) / (samples - 1);
  return Array.from({ length: samples }, (_, i) => {
    const x = min + step * i;
    const y = slope * x + intercept;
    return [x, y] as [number, number];
  });
};

const demand = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  const points = linear(params, xDomain, samples);
  return points.map(([x, y]) => [x, Math.max(0, y)] as [number, number]);
};

const supply = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  const points = linear(params, xDomain, samples);
  return points.map(([x, y]) => [x, Math.max(0, y)] as [number, number]);
};

const utility = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  const { max = 100 } = params;
  const [min, maxX] = xDomain;
  const xScale = scaleLinear().domain([min, maxX]).range([0, 1]);
  return Array.from({ length: samples }, (_, i) => {
    const x = min + ((maxX - min) * i) / (samples - 1);
    const u = max * Math.sqrt(1 - Math.pow(xScale(x), 2));
    return [x, Math.max(0, u)] as [number, number];
  });
};

const perfectlyInelastic = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  const { intercept = 6 } = params;
  const [min, max] = xDomain;
  const x = (min + max) / 2;
  return Array.from({ length: samples }, () => [x, Math.min(Math.max(0, intercept), 12)] as [number, number]);
};

const inelastic = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  return linear(params, xDomain, samples).map(([x, y]) => [x, Math.min(Math.max(0, y), 12)] as [number, number]);
};

const unitElastic = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  const { baseQ = 6, baseP = 4 } = params;
  const [min, max] = xDomain;
  const constant = baseQ * baseP;
  return Array.from({ length: samples }, (_, i) => {
    const x = min + ((max - min) * i) / (samples - 1);
    if (x === 0) return [x, 12] as [number, number];
    const y = constant / x;
    return [x, Math.min(Math.max(0, y), 12)] as [number, number];
  });
};

const elastic = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  return linear(params, xDomain, samples).map(([x, y]) => [x, Math.min(Math.max(0, y), 12)] as [number, number]);
};

const perfectlyElastic = (params: CurveParams, xDomain: [number, number], samples = 60): [number, number][] => {
  const { intercept = 5 } = params;
  const [min, max] = xDomain;
  return Array.from({ length: samples }, (_, i) => {
    const x = min + ((max - min) * i) / (samples - 1);
    return [x, Math.min(Math.max(0, intercept), 12)] as [number, number];
  });
};

export const curveRegistry: Record<string, CurveGenerator> = {
  linear: { id: 'linear', label: 'Linear', generate: linear },
  demand: { id: 'demand', label: 'Demand', generate: demand },
  supply: { id: 'supply', label: 'Supply', generate: supply },
  utility: { id: 'utility', label: 'Utility', generate: utility },
  'perfectly-inelastic': { id: 'perfectly-inelastic', label: 'Perfectly Inelastic', generate: perfectlyInelastic },
  inelastic: { id: 'inelastic', label: 'Inelastic', generate: inelastic },
  'unit-elastic': { id: 'unit-elastic', label: 'Unit Elastic', generate: unitElastic },
  elastic: { id: 'elastic', label: 'Elastic', generate: elastic },
  'perfectly-elastic': { id: 'perfectly-elastic', label: 'Perfectly Elastic', generate: perfectlyElastic },
};
