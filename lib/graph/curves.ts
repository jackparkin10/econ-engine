import { line, curveBasis } from 'd3-shape';
import { Point, Curve } from './types';

export function generateLinearCurve(points: Point[]): string {
  if (points.length < 2) return '';
  const [start, ...rest] = points;
  let path = `M ${start.x} ${start.y}`;
  for (const point of rest) {
    path += ` L ${point.x} ${point.y}`;
  }
  return path;
}

export function generateCurvedCurve(points: Point[]): string {
  const lineGenerator = line<Point>()
    .x(d => d.x)
    .y(d => d.y)
    .curve(curveBasis);
  return lineGenerator(points) || '';
}

export function generateCurvePath(curve: Curve, xScale: any, yScale: any): string {
  const scaledPoints = curve.points.map(p => ({
    x: xScale(p.x),
    y: yScale(p.y),
  }));

  if (curve.type === 'linear') {
    return generateLinearCurve(scaledPoints);
  } else {
    return generateCurvedCurve(scaledPoints);
  }
}