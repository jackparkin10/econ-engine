import { GraphConfig } from '../../lib/graph';

export const surplusShortageConfig: GraphConfig = {
  width: 800,
  height: 600,
  xAxis: {
    min: 0,
    max: 10,
    label: 'Quantity',
  },
  yAxis: {
    min: 0,
    max: 10,
    label: 'Price',
  },
  supply: {
    type: 'linear',
    points: [
      { x: 1, y: 2 },
      { x: 9, y: 8 },
    ],
    draggable: false,
  },
  demand: {
    type: 'linear',
    points: [
      { x: 1, y: 8 },
      { x: 9, y: 2 },
    ],
    draggable: false,
  },
  equilibrium: true,
  surplus: true,
  shortage: true,
  animations: true,
};