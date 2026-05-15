export interface Point {
  x: number;
  y: number;
}

export interface Curve {
  type: 'linear' | 'quadratic' | 'cubic';
  points: Point[];
  draggable?: boolean;
  visible?: boolean;
}

export interface AxisConfig {
  min: number;
  max: number;
  ticks?: number[];
  label?: string;
}

export interface GraphConfig {
  width: number;
  height: number;
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  supply: Curve;
  demand: Curve;
  equilibrium?: boolean;
  surplus?: boolean;
  shortage?: boolean;
  animations?: boolean;
  priceLine?: boolean;
  quantityLine?: boolean;
}

export interface Equilibrium {
  x: number;
  y: number;
}

export interface Area {
  points: Point[];
}