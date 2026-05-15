import { Point, Curve } from './types';

export function calculateSurplusArea(_supply: Curve, _demand: Curve, equilibrium: Point, priceFloor?: number): Point[] {
  // For simplicity, assume linear and calculate triangle area
  // Points for shading above equilibrium
  if (priceFloor) {
    // Surplus with price floor
    return [
      { x: equilibrium.x, y: equilibrium.y },
      { x: priceFloor, y: priceFloor },
      { x: equilibrium.x, y: priceFloor },
    ];
  }
  return [];
}

export function calculateShortageArea(_supply: Curve, _demand: Curve, equilibrium: Point, priceCeiling?: number): Point[] {
  // Shortage below equilibrium
  if (priceCeiling) {
    return [
      { x: equilibrium.x, y: equilibrium.y },
      { x: priceCeiling, y: priceCeiling },
      { x: equilibrium.x, y: priceCeiling },
    ];
  }
  return [];
}