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

export type TickFormat = 'integer' | 'decimal-2' | 'auto';

export interface AxisConfig {
  label: string;
  min: number;
  max: number;
  ticks?: number[];
  tickFormat?: TickFormat;
  format?: (value: number) => string;
  /** Label rotation in degrees (default: 0 for x, -90 for y). */
  titleRotation?: number;
  /** Place y-axis title just above the maximum tick (e.g. above “2”). */
  titleAboveMaxTick?: boolean;
  titleOffsetX?: number;
  titleOffsetY?: number;
}

export interface CurvePoint {
  /** Quantity (horizontal axis in standard chapters). */
  x: number;
  /** Price (vertical axis in standard chapters). */
  y: number;
}

export interface CurveParams {
  slope?: number;
  intercept?: number;
  elasticity?: number;
  max?: number;
  min?: number;
  baseQ?: number;
  baseP?: number;
  /** Control points for `throughPoints` curves (smooth, in Q–P space). */
  points?: CurvePoint[];
}

export interface GraphCoordinatesConfig {
  x: 'quantity' | 'price';
  y: 'quantity' | 'price';
}

export interface CurveSpec {
  id: string;
  label?: string;
  curveType: string; // registered curve generator key
  params: CurveParams;
  /** Theme role key, e.g. "demand" or "supplyInitial" */
  colorRole?: string;
  /** Override color role per mode (e.g. book preview styling). */
  colorRoleByMode?: Partial<Record<StageMode, string>>;
  color?: string;
  visible?: boolean;
  draggable?: boolean;
  animated?: boolean;
  /** In build, slide in from another curve’s shape when this layer appears (source stays visible). */
  morphFromCurveId?: string;
  strokeDasharray?: string;
}

export interface EquilibriumSpec {
  id: string;
  demandCurveId: string;
  supplyCurveId: string;
  colorRole?: string;
  color?: string;
  label?: string;
  /** Optional fixed equilibrium in Q–P space (used for non-linear curves). */
  point?: CurvePoint;
  /** When visible, label equilibrium Q/P on the axes in red; add P to y ticks if missing. */
  highlightAxisValues?: boolean;
}

export interface ExploreBinding {
  targetKey: string;
  curveId: string;
  param: keyof CurveParams;
}

export interface AnnotationSpec {
  id: string;
  text: string;
  x: number;
  y: number;
  anchor?: 'start' | 'middle' | 'end';
}

export interface BuildStepAxisHighlight {
  equilibriumId: string;
  price?: boolean;
  quantity?: boolean;
}

export interface BuildStep {
  id: string;
  title: string;
  description?: string;
  visibleLayers?: string[];
  activeControls?: string[];
  showEquilibrium?: boolean;
  visibleEquilibria?: string[];
  /** Subset of `visibleEquilibria` that show intersection dots (defaults to all visible). */
  visibleEquilibriumPoints?: string[];
  visibleAnnotations?: string[];
  showPriceLine?: boolean;
  showQuantityLine?: boolean;
  /** Equilibrium ids that get a horizontal price guide (defaults to all visible when `showPriceLine`). */
  priceGuideEquilibria?: string[];
  /** Equilibrium ids that get a vertical quantity guide (defaults to all visible when `showQuantityLine`). */
  quantityGuideEquilibria?: string[];
  /** Per-step axis tick highlights (overrides `EquilibriumSpec.highlightAxisValues` when set). */
  axisHighlights?: BuildStepAxisHighlight[];
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface GraphArrowStrokeGradient {
  fromColorRole?: string;
  toColorRole?: string;
  fromColor?: string;
  toColor?: string;
}

export interface GraphArrowSpec {
  id: string;
  from?: GraphPoint;
  to?: GraphPoint;
  /** With `followCurveId`, quantity (x when graph x = quantity); price (y) is resolved from the curve. */
  fromQuantity?: number;
  /** With `followCurveId`, quantity (x when graph x = quantity); price (y) is resolved from the curve. */
  toQuantity?: number;
  label: string;
  calloutColorRole?: string;
  calloutColor?: string;
  strokeColorRole?: string;
  strokeColor?: string;
  borderColorRole?: string;
  borderColor?: string;
  /** Override theme border width; use `0` for no outline. */
  borderWidth?: number;
  /** Override theme arrow fill opacity (1 = fully opaque). */
  fillOpacity?: number;
  strokeGradient?: GraphArrowStrokeGradient;
  labelOffset?: GraphPoint;
  /** Multiplier for arrow shaft/head width only, not length (default 1). */
  thicknessScale?: number;
  /** Bend the arrow along an existing chapter curve between `from` and `to`. */
  followCurveId?: string;
  /** Draw this arrow beneath the curve with this id (e.g. `'demand'`). */
  belowCurveId?: string;
}

export interface GraphCalloutSpec {
  id: string;
  x: number;
  y: number;
  label: string;
  calloutColorRole?: string;
  calloutColor?: string;
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
  anchor?: 'start' | 'middle' | 'end';
  /** Extra offset in Q–P space after anchor positioning. */
  offsetX?: number;
  offsetY?: number;
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

/** Static textbook figure shown in Book mode (see src/assets/chapters/<chapter-id>/). */
export interface ChapterBookView {
  imageSrc: string;
  alt?: string;
}

export interface ChapterConfig {
  id: string;
  title: string;
  description: string;
  themeColor: string;
  /** Registered graph theme id (see config/graphThemes). */
  graphThemeId?: string;
  /** Maps plot axes to economic variables. Default: x=quantity, y=price. */
  graphCoordinates?: GraphCoordinatesConfig;
  /** Curves shown in book mode when `bookBuildStepId` is not set. */
  bookLayers?: string[];
  /** Book mode mirrors this build step’s graph state (layers, equilibria, arrows). */
  bookBuildStepId?: string;
  /** Replaces the live graph in Book mode with a static figure. */
  bookView?: ChapterBookView;
  graphLayout?: {
    width?: number;
    height?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    background?: string;
    borderRadius?: number;
    equalAxisLengths?: boolean;
  };
  graphType: GraphType;
  showTable: boolean;
  tablePosition: 'left' | 'right' | 'none';
  xAxis: AxisConfig;
  yAxis: AxisConfig;
  curves: CurveSpec[];
  equilibria?: EquilibriumSpec[];
  equilibriumPoint?: { x: number; y: number };
  exploreBindings?: ExploreBinding[];
  exploreLayers?: string[];
  annotations?: AnnotationSpec[];
  buildSteps?: BuildStep[];
  animationSteps?: AnimationStep[];
  exploreControls?: ExploreControl[];
  exploreScenarios?: ExploreScenario[];
  curveLabels?: CurveLabel[];
  graphArrows?: GraphArrowSpec[];
  modeContent?: ModeContent;
  dataRows?: Record<string, string | number>[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}
