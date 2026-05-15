export type GraphType =
  | 'supply-demand'
  | 'ppc'
  | 'cost-curves'
  | 'ad-as'
  | 'elasticity'
  | 'utility'
  | 'line-chart'
  | 'bar-chart';

export type StageMode = 'book' | 'animate' | 'build' | 'explore';

export interface AxisConfig {
  label: string;
  min: number;
  max: number;
  ticks?: number[];
  format?: (value: number) => string;
}

export interface CurveParams {
  slope?: number;
  intercept?: number;
  elasticity?: number;
  max?: number;
  min?: number;
  baseQ?: number;
  baseP?: number;
}

export interface CurveSpec {
  id: string;
  label?: string;
  curveType: string; // registered curve generator key
  params: CurveParams;
  color?: string;
  visible?: boolean;
  draggable?: boolean;
  animated?: boolean;
}

export interface AnnotationSpec {
  id: string;
  text: string;
  x: number;
  y: number;
  anchor?: 'start' | 'middle' | 'end';
}

export interface BuildStep {
  id: string;
  title: string;
  description?: string;
  visibleLayers?: string[];
  activeControls?: string[];
  showEquilibrium?: boolean;
  showPriceLine?: boolean;
  showQuantityLine?: boolean;
}

export interface ExploreControl {
  id: string;
  label: string;
  type: 'slider' | 'toggle' | 'button';
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | boolean;
  targetKey: string;
}

export interface AnimationStep {
  id: string;
  title: string;
  description?: string;
  durationMs: number;
  delayMs?: number;
  layerIds?: string[];
  annotationIds?: string[];
}

export interface CurveLabel {
  curveId: string;
  text: string;
  x: number;
  y: number;
}

export interface ExploreScenario {
  id: string;
  label: string;
  description?: string;
  pricePoint?: number;
  calculateQd?: (p: number, demandCurve: CurveSpec) => number;
  calculateQs?: (p: number, supplyCurve: CurveSpec) => number;
}

export interface ModeContent {
  book?: string;
  animate?: string;
}

export interface ChapterConfig {
  id: string;
  title: string;
  description: string;
  themeColor: string;
  graphType: GraphType;
  showTable: boolean;
  tablePosition: 'left' | 'right' | 'none';
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  curves: CurveSpec[];
  equilibriumPoint?: { x: number; y: number };
  annotations?: AnnotationSpec[];
  buildSteps?: BuildStep[];
  animationSteps?: AnimationStep[];
  exploreControls?: ExploreControl[];
  exploreScenarios?: ExploreScenario[];
  curveLabels?: CurveLabel[];
  modeContent?: ModeContent;
  dataRows?: Record<string, string | number>[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}
