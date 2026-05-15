import React from 'react';
import { GraphConfig } from '../../../lib/graph';
import { findIntersection, createXScale, createYScale } from '../../../lib/graph';
import { theme } from '../../theme';

interface EquilibriumPointProps {
  config: GraphConfig;
}

const EquilibriumPoint: React.FC<EquilibriumPointProps> = ({ config }) => {
  const equilibrium = findIntersection(config.supply, config.demand);
  if (!equilibrium) return null;

  const xScale = createXScale(config.xAxis, config.width);
  const yScale = createYScale(config.yAxis, config.height);

  const screenPoint = {
    x: xScale(equilibrium.x),
    y: yScale(equilibrium.y),
  };

  return (
    <g>
      {/* Equilibrium point */}
      <circle
        cx={screenPoint.x}
        cy={screenPoint.y}
        r={6}
        fill={theme.colors.equilibrium}
        stroke="white"
        strokeWidth={2}
      />
      
      {/* Price line (horizontal from equilibrium to y-axis) */}
      {config.priceLine && (
        <line
          x1={xScale(config.xAxis.min)}
          y1={screenPoint.y}
          x2={screenPoint.x}
          y2={screenPoint.y}
          stroke={theme.colors.equilibrium}
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      )}
      
      {/* Quantity line (vertical from equilibrium to x-axis) */}
      {config.quantityLine && (
        <line
          x1={screenPoint.x}
          y1={yScale(config.yAxis.max)}
          x2={screenPoint.x}
          y2={screenPoint.y}
          stroke={theme.colors.equilibrium}
          strokeWidth={2}
          strokeDasharray="5,5"
        />
      )}
    </g>
  );
};

export default EquilibriumPoint;