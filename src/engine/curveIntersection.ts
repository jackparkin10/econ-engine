import { CurvePoint, CurveSpec } from './types';

interface Point {
  x: number;
  y: number;
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Uniform Catmull–Rom segment (matches d3 curveCatmullRom α=0.5 between knots). */
const catmullRom = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
};

export const sampleCatmullRom = (controlPoints: CurvePoint[], samplesPerSegment = 48): Point[] => {
  if (controlPoints.length === 0) return [];
  if (controlPoints.length === 1) return [{ x: controlPoints[0].x, y: controlPoints[0].y }];
  if (controlPoints.length === 2) {
    return Array.from({ length: samplesPerSegment + 1 }, (_, i) => {
      const t = i / samplesPerSegment;
      return {
        x: controlPoints[0].x + t * (controlPoints[1].x - controlPoints[0].x),
        y: controlPoints[0].y + t * (controlPoints[1].y - controlPoints[0].y),
      };
    });
  }

  const knots = controlPoints.map((p) => ({ x: p.x, y: p.y }));
  const samples: Point[] = [];

  for (let i = 0; i < knots.length - 1; i++) {
    const p0 = knots[Math.max(0, i - 1)];
    const p1 = knots[i];
    const p2 = knots[i + 1];
    const p3 = knots[Math.min(knots.length - 1, i + 2)];
    const steps = i === knots.length - 2 ? samplesPerSegment + 1 : samplesPerSegment;
    for (let s = 0; s < steps; s++) {
      const t = s / samplesPerSegment;
      samples.push(catmullRom(p0, p1, p2, p3, t));
    }
  }

  return samples;
};

const segmentIntersection = (a0: Point, a1: Point, b0: Point, b1: Point): Point | null => {
  const dxA = a1.x - a0.x;
  const dyA = a1.y - a0.y;
  const dxB = b1.x - b0.x;
  const dyB = b1.y - b0.y;
  const denom = dxA * dyB - dyA * dxB;
  if (Math.abs(denom) < 1e-14) return null;

  const t = ((b0.x - a0.x) * dyB - (b0.y - a0.y) * dxB) / denom;
  const u = ((b0.x - a0.x) * dyA - (b0.y - a0.y) * dxA) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  return { x: a0.x + t * dxA, y: a0.y + t * dyA };
};

/** Intersection of two `throughPoints` curves in Q–P space. */
export const findThroughPointsIntersection = (
  curveA: CurveSpec,
  curveB: CurveSpec
): Point | null => {
  const pointsA = curveA.params.points ?? [];
  const pointsB = curveB.params.points ?? [];
  if (pointsA.length < 2 || pointsB.length < 2) return null;

  const samplesA = sampleCatmullRom(pointsA);
  const samplesB = sampleCatmullRom(pointsB);

  const hits: Point[] = [];

  for (let i = 0; i < samplesA.length - 1; i++) {
    const a0 = samplesA[i];
    const a1 = samplesA[i + 1];
    for (let j = 0; j < samplesB.length - 1; j++) {
      const hit = segmentIntersection(a0, a1, samplesB[j], samplesB[j + 1]);
      if (hit) hits.push(hit);
    }
  }

  if (hits.length > 0) {
    return {
      x: hits.reduce((sum, point) => sum + point.x, 0) / hits.length,
      y: hits.reduce((sum, point) => sum + point.y, 0) / hits.length,
    };
  }

  let closest: { point: Point; dist: number } | null = null;
  for (const a of samplesA) {
    for (const b of samplesB) {
      const dist = distance(a, b);
      if (!closest || dist < closest.dist) {
        closest = { point: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, dist };
      }
    }
  }

  return closest && closest.dist < 0.05 ? closest.point : null;
};

export const insertCurveKnot = (curve: CurveSpec, knot: CurvePoint, tolerance = 0.008): CurveSpec => {
  if (curve.curveType !== 'throughPoints' || !curve.params.points?.length) return curve;

  const exists = curve.params.points.some((p) => distance(p, knot) < tolerance);
  if (exists) return curve;

  const points = [...curve.params.points, knot].sort((a, b) => a.x - b.x);
  return { ...curve, params: { ...curve.params, points } };
};

export const insertEquilibriumKnots = (
  curves: CurveSpec[],
  knots: Array<{ demandCurveId: string; supplyCurveId: string; point: CurvePoint }>
): CurveSpec[] => {
  let result = curves;
  for (const knot of knots) {
    result = result.map((curve) => {
      if (curve.id === knot.demandCurveId || curve.id === knot.supplyCurveId) {
        return insertCurveKnot(curve, knot.point);
      }
      return curve;
    });
  }
  return result;
};
