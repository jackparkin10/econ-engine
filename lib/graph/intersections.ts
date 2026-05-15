import { Point, Curve } from './types';

export function findIntersection(supply: Curve, demand: Curve): Point | null {
  // Simple linear intersection for now
  // For linear curves, solve system of equations
  if (supply.type === 'linear' && demand.type === 'linear') {
    const s1 = supply.points[0];
    const s2 = supply.points[1];
    const d1 = demand.points[0];
    const d2 = demand.points[1];

    const m_s = (s2.y - s1.y) / (s2.x - s1.x);
    const b_s = s1.y - m_s * s1.x;

    const m_d = (d2.y - d1.y) / (d2.x - d1.x);
    const b_d = d1.y - m_d * d1.x;

    if (m_s === m_d) return null; // parallel

    const x = (b_d - b_s) / (m_s - m_d);
    const y = m_s * x + b_s;

    return { x, y };
  }

  // For curved, approximate or use numerical method
  // For simplicity, return midpoint or something
  return null;
}