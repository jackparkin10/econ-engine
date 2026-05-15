import React from 'react';
import { GraphConfig } from '../../../lib/graph';
import { theme } from '../../theme';

interface AxesProps {
  config: GraphConfig;
}

const Axes: React.FC<AxesProps> = ({ config }) => {
  const { width, height, xAxis, yAxis } = config;

  const xTicks = xAxis.ticks || Array.from({ length: 11 }, (_, i) => (xAxis.max - xAxis.min) * i / 10 + xAxis.min);
  const yTicks = yAxis.ticks || Array.from({ length: 11 }, (_, i) => (yAxis.max - yAxis.min) * i / 10 + yAxis.min);

  return (
    <g>
      {/* X-axis */}
      <line
        x1={0}
        y1={height}
        x2={width}
        y2={height}
        stroke={theme.colors.axis}
        strokeWidth={2}
      />
      {/* Y-axis */}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={height}
        stroke={theme.colors.axis}
        strokeWidth={2}
      />
      
      {/* X-axis ticks and labels */}
      {xTicks.map(tick => {
        const x = (tick - xAxis.min) / (xAxis.max - xAxis.min) * width;
        return (
          <g key={`x-tick-${tick}`}>
            <line
              x1={x}
              y1={height}
              x2={x}
              y2={height + 5}
              stroke={theme.colors.axis}
              strokeWidth={1}
            />
            <text
              x={x}
              y={height + 20}
              textAnchor="middle"
              fontSize={theme.typography.fontSize.small}
              fill={theme.colors.axis}
            >
              {tick.toFixed(0)}
            </text>
          </g>
        );
      })}
      
      {/* Y-axis ticks and labels */}
      {yTicks.map(tick => {
        const y = height - (tick - yAxis.min) / (yAxis.max - yAxis.min) * height;
        return (
          <g key={`y-tick-${tick}`}>
            <line
              x1={0}
              y1={y}
              x2={-5}
              y2={y}
              stroke={theme.colors.axis}
              strokeWidth={1}
            />
            <text
              x={-10}
              y={y + 4}
              textAnchor="end"
              fontSize={theme.typography.fontSize.small}
              fill={theme.colors.axis}
            >
              {tick.toFixed(0)}
            </text>
          </g>
        );
      })}
      
      {/* Labels */}
      {xAxis.label && (
        <text
          x={width / 2}
          y={height + 40}
          textAnchor="middle"
          fontSize={theme.typography.fontSize.medium}
          fill={theme.colors.axis}
        >
          {xAxis.label}
        </text>
      )}
      {yAxis.label && (
        <text
          x={-40}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, -40, ${height / 2})`}
          fontSize={theme.typography.fontSize.medium}
          fill={theme.colors.axis}
        >
          {yAxis.label}
        </text>
      )}
    </g>
  );
};

export default Axes;