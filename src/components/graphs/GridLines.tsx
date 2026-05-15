import React from 'react';
import { GraphConfig } from '../../../lib/graph';
import { theme } from '../../theme';

interface GridLinesProps {
  config: GraphConfig;
}

const GridLines: React.FC<GridLinesProps> = ({ config }) => {
  const { width, height, xAxis, yAxis } = config;

  const xTicks = xAxis.ticks || [];
  const yTicks = yAxis.ticks || [];

  return (
    <g>
      {xTicks.map(tick => (
        <line
          key={`x-${tick}`}
          x1={tick}
          y1={0}
          x2={tick}
          y2={height}
          stroke={theme.grid.stroke}
          strokeWidth={theme.grid.strokeWidth}
        />
      ))}
      {yTicks.map(tick => (
        <line
          key={`y-${tick}`}
          x1={0}
          y1={tick}
          x2={width}
          y2={tick}
          stroke={theme.grid.stroke}
          strokeWidth={theme.grid.strokeWidth}
        />
      ))}
    </g>
  );
};

export default GridLines;