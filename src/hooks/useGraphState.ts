import { useState, useCallback } from 'react';
import { GraphConfig, Curve } from '../../lib/graph';

export function useGraphState(initialConfig: GraphConfig) {
  const [config, setConfig] = useState(initialConfig);

  const updateCurve = useCallback((curveType: 'supply' | 'demand', newPoints: Curve['points']) => {
    setConfig(prev => ({
      ...prev,
      [curveType]: {
        ...prev[curveType],
        points: newPoints,
      },
    }));
  }, []);

  const updateAxis = useCallback((axis: 'xAxis' | 'yAxis', newConfig: Partial<GraphConfig['xAxis']>) => {
    setConfig(prev => ({
      ...prev,
      [axis]: {
        ...prev[axis],
        ...newConfig,
      },
    }));
  }, []);

  return {
    config,
    updateCurve,
    updateAxis,
  };
}