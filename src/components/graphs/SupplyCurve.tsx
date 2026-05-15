import React, { useState } from 'react';
import { GraphConfig } from '../../../lib/graph';
import { generateCurvePath, createXScale, createYScale, scaleFromScreen } from '../../../lib/graph';
import { theme } from '../../theme';

interface SupplyCurveProps {
  config: GraphConfig;
  onChange?: (config: GraphConfig) => void;
}

const SupplyCurve: React.FC<SupplyCurveProps> = ({ config, onChange }) => {
  // Don't render if not visible
  if (config.supply.visible === false) return null;

  const xScale = createXScale(config.xAxis, config.width);
  const yScale = createYScale(config.yAxis, config.height);

  const path = generateCurvePath(config.supply, xScale, yScale);

  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!config.supply.draggable || !onChange) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !onChange) return;
    
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    const economicPoint = scaleFromScreen(xScale, yScale, { x: screenX, y: screenY });
    
    // For simplicity, adjust the curve by moving the second point
    const newPoints = [...config.supply.points];
    if (newPoints.length >= 2) {
      newPoints[1] = {
        x: Math.max(config.xAxis.min, Math.min(config.xAxis.max, economicPoint.x)),
        y: Math.max(config.yAxis.min, Math.min(config.yAxis.max, economicPoint.y)),
      };
      
      const newConfig = {
        ...config,
        supply: { ...config.supply, points: newPoints },
      };
      
      onChange(newConfig);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <path
      d={path}
      stroke={theme.colors.supply}
      strokeWidth={3}
      fill="none"
      className={config.supply.draggable ? 'cursor-pointer' : ''}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default SupplyCurve;