import React from 'react';
import { GraphConfig } from '../../../lib/graph';
import { findIntersection, createXScale, createYScale } from '../../../lib/graph';
import { theme } from '../../theme';

interface ShadedAreaProps {
  config: GraphConfig;
  selectedPrice?: number | null;
}

const ShadedArea: React.FC<ShadedAreaProps> = ({ config, selectedPrice }) => {
  const equilibrium = findIntersection(config.supply, config.demand);
  if (!equilibrium) return null;

  const xScale = createXScale(config.xAxis, config.width);
  const yScale = createYScale(config.yAxis, config.height);

  let areas: { points: { x: number; y: number }[]; color: string }[] = [];

  const priceToUse = selectedPrice !== null && selectedPrice !== undefined ? selectedPrice : equilibrium.y;

  if (config.surplus) {
    const surplusPoints = calculateSurplusAtPrice(config.supply, config.demand, priceToUse, xScale, yScale);
    if (surplusPoints.length > 0) {
      areas.push({
        points: surplusPoints,
        color: theme.colors.surplus,
      });
    }
  }

  if (config.shortage) {
    const shortagePoints = calculateShortageAtPrice(config.supply, config.demand, priceToUse, xScale, yScale);
    if (shortagePoints.length > 0) {
      areas.push({
        points: shortagePoints,
        color: theme.colors.shortage,
      });
    }
  }

  return (
    <g>
      {areas.map((area, i) => (
        <polygon
          key={i}
          points={area.points.map(p => `${p.x},${p.y}`).join(' ')}
          fill={area.color}
          opacity={0.3}
        />
      ))}
    </g>
  );
};

// Helper functions to calculate areas at a specific price
function calculateSurplusAtPrice(
  supply: any, 
  _demand: any, 
  price: number, 
  xScale: any, 
  yScale: any
): { x: number; y: number }[] {
  // For linear curves, find quantity where supply intersects price
  if (supply.points.length >= 2) {
    const s1 = supply.points[0];
    const s2 = supply.points[1];
    const m_s = (s2.y - s1.y) / (s2.x - s1.x);
    const b_s = s1.y - m_s * s1.x;
    
    // Supply quantity at price
    const q_s = Math.max(0, (price - b_s) / m_s);
    
    // Points for surplus area (above price, left of supply)
    return [
      { x: xScale(0), y: yScale(price) },
      { x: xScale(q_s), y: yScale(price) },
      { x: xScale(q_s), y: yScale(Math.min(price, s1.y + m_s * q_s)) },
    ];
  }
  return [];
}

function calculateShortageAtPrice(
  _supply: any, 
  demand: any, 
  price: number, 
  xScale: any, 
  yScale: any
): { x: number; y: number }[] {
  // For linear curves, find quantity where demand intersects price
  if (demand.points.length >= 2) {
    const d1 = demand.points[0];
    const d2 = demand.points[1];
    const m_d = (d2.y - d1.y) / (d2.x - d1.x);
    const b_d = d1.y - m_d * d1.x;
    
    // Demand quantity at price
    const q_d = Math.max(0, (price - b_d) / m_d);
    
    // Points for shortage area (below price, right of demand)
    return [
      { x: xScale(q_d), y: yScale(price) },
      { x: xScale(100), y: yScale(price) }, // Assuming max x is 100
      { x: xScale(q_d), y: yScale(Math.max(price, d1.y + m_d * q_d)) },
    ];
  }
  return [];
}

export default ShadedArea;