import React from 'react';
import { GraphConfig } from '../../../lib/graph';
import Axes from './Axes';
import GridLines from './GridLines';
import SupplyCurve from './SupplyCurve';
import DemandCurve from './DemandCurve';
import EquilibriumPoint from './EquilibriumPoint';
import ShadedArea from './ShadedArea';

interface EconGraphProps {
  config: GraphConfig;
  onConfigChange?: (config: GraphConfig) => void;
  onGraphClick?: (price: number) => void;
  selectedPrice?: number | null;
}

const EconGraph: React.FC<EconGraphProps> = ({ config, onConfigChange, onGraphClick, selectedPrice }) => {
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onGraphClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Convert screen Y to economic price
    const price = config.yAxis.max - (y / config.height) * (config.yAxis.max - config.yAxis.min);
    const clampedPrice = Math.max(config.yAxis.min, Math.min(config.yAxis.max, price));
    
    onGraphClick(clampedPrice);
  };

  return (
    <div className="w-full bg-white border rounded-lg shadow-lg" style={{ height: config.height + 80 }}>
      <svg 
        width={config.width} 
        height={config.height} 
        className="overflow-visible"
        onClick={handleSvgClick}
      >
        <GridLines config={config} />
        <Axes config={config} />
        <SupplyCurve config={config} onChange={onConfigChange} />
        <DemandCurve config={config} onChange={onConfigChange} />
        {config.equilibrium && <EquilibriumPoint config={config} />}
        {(config.surplus || config.shortage) && <ShadedArea config={config} selectedPrice={selectedPrice} />}
        {selectedPrice !== null && selectedPrice !== undefined && (
          <line
            x1={0}
            y1={(config.yAxis.max - selectedPrice) / (config.yAxis.max - config.yAxis.min) * config.height}
            x2={config.width}
            y2={(config.yAxis.max - selectedPrice) / (config.yAxis.max - config.yAxis.min) * config.height}
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
      </svg>
    </div>
  );
};

export default EconGraph;