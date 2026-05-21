import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { ChapterConfig, GraphArrowSpec, StageMode, BuildStep } from '../../engine/types';
import {
  applyExploreBindings,
  buildCurvedArrowGeometry,
  resolveGraphArrowEndpoints,
  createScales,
  curvePath,
  findEquilibrium,
  insertEquilibriumKnots,
  interpolateCurvePoints,
  resolveEquilibria,
  type ResolvedEquilibrium,
} from '../../engine/graphEngine';
import {
  formatAxisTick,
  resolveChapterGraphStyle,
  resolveArrowBorder,
  resolveArrowGradient,
  resolveArrowStroke,
  resolveCalloutFill,
  resolveEquilibriumColor,
} from '../../engine/resolveGraphStyle';
import { renderExploreIllustration } from '../../engine/strategies/supplyDemandStrategy';
import { getElasticityScenario, calculateElasticityPoint } from '../../engine/strategies/elasticityStrategy';
import { GraphArrow } from '../graph/graphArrow';

interface GraphCanvasProps {
  chapter: ChapterConfig;
  mode?: StageMode;
  activeStep?: BuildStep;
  exploreValues?: Record<string, number | boolean>;
}

const ELASTICITY_CURVE_BY_LEVEL = [
  'perfectly-inelastic',
  'inelastic',
  'unit-elastic',
  'elastic',
  'perfectly-elastic',
] as const;

const GraphCanvas: React.FC<GraphCanvasProps> = ({ chapter, mode = 'book', activeStep, exploreValues }) => {
  const teachingStep = useMemo(() => {
    if (mode !== 'book' && mode !== 'explore') return undefined;
    if (!chapter.bookBuildStepId) return undefined;
    return chapter.buildSteps?.find((step) => step.id === chapter.bookBuildStepId);
  }, [chapter.bookBuildStepId, chapter.buildSteps, mode]);

  const stepSnapshot =
    mode === 'build' ? activeStep : mode === 'book' || mode === 'explore' ? teachingStep : undefined;
  const usesStepSnapshot =
    Boolean(stepSnapshot) && (mode === 'book' || mode === 'build' || mode === 'explore');

  const style = useMemo(() => resolveChapterGraphStyle(chapter, mode), [chapter, mode]);
  const { layout, theme } = style;
  const width = layout.width;
  const height = layout.height;
  const margin = layout.margin;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const plotExtent = layout.equalAxisLengths ? Math.min(innerWidth, innerHeight) : null;
  const plotWidth = plotExtent ?? innerWidth;
  const plotHeight = plotExtent ?? innerHeight;
  const plotBottom = innerHeight;
  const plotTop = plotBottom - plotHeight;

  const scales = useMemo(
    () => createScales(chapter.xAxis, chapter.yAxis, plotWidth, plotHeight),
    [chapter.xAxis, chapter.yAxis, plotWidth, plotHeight]
  );
  const baseCurves = useMemo(() => {
    if (mode === 'build' && activeStep === undefined) {
      return [];
    }
    if (usesStepSnapshot && stepSnapshot) {
      const layers = stepSnapshot.visibleLayers ?? [];
      return chapter.curves.filter((curve) => layers.includes(curve.id));
    }
    if (mode === 'book' && chapter.bookLayers?.length) {
      return chapter.curves.filter((curve) => chapter.bookLayers?.includes(curve.id));
    }
    if (mode === 'explore' && chapter.graphType === 'elasticity') {
      const level = Math.round(Number(exploreValues?.elasticity ?? 0));
      const curveId = ELASTICITY_CURVE_BY_LEVEL[Math.max(0, Math.min(4, level))];
      return chapter.curves.filter((curve) => curve.id === curveId);
    }
    if (mode === 'explore' && chapter.exploreLayers?.length) {
      return chapter.curves.filter((curve) => chapter.exploreLayers?.includes(curve.id));
    }
    return chapter.curves.filter((curve) => curve.visible !== false);
  }, [
    chapter.curves,
    chapter.bookLayers,
    chapter.exploreLayers,
    chapter.graphType,
    mode,
    usesStepSnapshot,
    stepSnapshot,
    activeStep,
    exploreValues?.elasticity,
  ]);

  const showSurplus = mode === 'explore' && exploreValues?.surplus === true;
  const showShortage = mode === 'explore' && exploreValues?.shortage === true;

  const { displayCurves, equilibriaToRender } = useMemo(() => {
    const boundCurves = applyExploreBindings(chapter, baseCurves, exploreValues);

    if (showSurplus || showShortage) {
      return { displayCurves: boundCurves, equilibriaToRender: [] as ResolvedEquilibrium[] };
    }

    let resolved: ResolvedEquilibrium[] = [];

    if (chapter.equilibria?.length) {
      if (usesStepSnapshot && stepSnapshot?.showEquilibrium) {
        const ids = stepSnapshot.visibleEquilibria ?? chapter.equilibria.map((entry) => entry.id);
        resolved = resolveEquilibria(chapter, boundCurves, ids);
      } else if (mode === 'explore') {
        resolved = resolveEquilibria(chapter, boundCurves);
      }
    } else {
      const point = chapter.equilibriumPoint ?? findEquilibrium(boundCurves, chapter);
      if (point) {
        resolved = [{ id: 'default', point, color: style.resolveColor('equilibrium') }];
      }
    }

    const equilibriaToRender = resolved.map((entry) => {
      const spec = chapter.equilibria?.find((item) => item.id === entry.id);
      return {
        ...entry,
        color: spec ? resolveEquilibriumColor(style, spec) : entry.color,
      };
    });

    const knots = (chapter.equilibria ?? [])
      .filter((spec) => equilibriaToRender.some((entry) => entry.id === spec.id))
      .map((spec) => {
        const equilibrium = equilibriaToRender.find((entry) => entry.id === spec.id);
        if (!equilibrium) return null;
        return {
          demandCurveId: spec.demandCurveId,
          supplyCurveId: spec.supplyCurveId,
          point: { x: equilibrium.point.x, y: equilibrium.point.y },
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const displayCurves = insertEquilibriumKnots(boundCurves, knots);

    return { displayCurves, equilibriaToRender };
  }, [
    chapter,
    baseCurves,
    exploreValues,
    mode,
    usesStepSnapshot,
    stepSnapshot,
    showSurplus,
    showShortage,
    style,
  ]);

  const usesTeachingSnapshot = usesStepSnapshot && (mode === 'book' || mode === 'explore');
  const showEquilibriumGuides =
    (mode !== 'build' && !usesTeachingSnapshot) || Boolean(stepSnapshot?.showEquilibrium);
  const showPriceLine =
    (mode !== 'build' && !usesTeachingSnapshot) || Boolean(stepSnapshot?.showPriceLine);
  const showQuantityLine =
    (mode !== 'build' && !usesTeachingSnapshot) || Boolean(stepSnapshot?.showQuantityLine);

  const visibleArrowIds = useMemo(() => {
    if (usesStepSnapshot && stepSnapshot?.visibleAnnotations?.length) {
      return stepSnapshot.visibleAnnotations;
    }
    if (mode === 'explore' && !usesTeachingSnapshot) {
      return chapter.graphArrows?.map((arrow) => arrow.id) ?? [];
    }
    return [];
  }, [mode, usesStepSnapshot, stepSnapshot, chapter.graphArrows]);

  const supplyDemandExploreIllustration = useMemo(() => {
    if (chapter.graphType !== 'supply-demand') return null;
    if (!showSurplus && !showShortage) return null;

    const scenario = chapter.exploreScenarios?.find(
      (s) => (showSurplus && s.id === 'surplus') || (showShortage && s.id === 'shortage')
    );
    if (!scenario) return null;

    return renderExploreIllustration(scenario, chapter);
  }, [chapter, showSurplus, showShortage]);

  const elasticityLevel = mode === 'explore' ? (exploreValues?.elasticity ?? 0) : -1;
  const showPriceChange = mode === 'explore' && exploreValues?.showPriceChange === true;

  const elasticityExploreData = useMemo(() => {
    if (chapter.graphType !== 'elasticity' || (elasticityLevel as number) < 0) return null;
    const scenario = getElasticityScenario(elasticityLevel as number);
    return showPriceChange ? calculateElasticityPoint(scenario) : null;
  }, [chapter.graphType, elasticityLevel, showPriceChange]);

  const xTicks =
    chapter.xAxis.ticks ||
    Array.from({ length: 11 }, (_, i) => chapter.xAxis.min + ((chapter.xAxis.max - chapter.xAxis.min) * i) / 10);
  const baseYTicks =
    chapter.yAxis.ticks ||
    Array.from({ length: 11 }, (_, i) => chapter.yAxis.min + ((chapter.yAxis.max - chapter.yAxis.min) * i) / 10);

  const highlightedAxisValues = useMemo(() => {
    const quantities: number[] = [];
    const prices: number[] = [];
    for (const equilibrium of equilibriaToRender) {
      const stepHighlight = stepSnapshot?.axisHighlights?.find(
        (entry) => entry.equilibriumId === equilibrium.id
      );
      if (stepHighlight) {
        if (stepHighlight.quantity) quantities.push(equilibrium.point.x);
        if (stepHighlight.price) prices.push(equilibrium.point.y);
        continue;
      }
      const spec = chapter.equilibria?.find((entry) => entry.id === equilibrium.id);
      if (!spec?.highlightAxisValues) continue;
      quantities.push(equilibrium.point.x);
      prices.push(equilibrium.point.y);
    }
    return { quantities, prices };
  }, [equilibriaToRender, chapter.equilibria, stepSnapshot?.axisHighlights]);

  const tickNear = (tick: number, values: number[]) =>
    values.some((value) => Math.abs(tick - value) < 0.001);

  const yTicks = useMemo(() => {
    const extraPrices = highlightedAxisValues.prices.filter(
      (price) => !baseYTicks.some((tick) => Math.abs(tick - price) < 0.001)
    );
    if (extraPrices.length === 0) return baseYTicks;
    return [...baseYTicks, ...extraPrices].sort((a, b) => a - b);
  }, [baseYTicks, highlightedAxisValues.prices]);

  const highlightTickFill = style.resolveColor('supplyInitial');

  const isHighlightedAxisTick = (tick: number, axis: 'x' | 'y') =>
    axis === 'x'
      ? tickNear(tick, highlightedAxisValues.quantities)
      : tickNear(tick, highlightedAxisValues.prices);

  const tickLabelStyle = (tick: number, axis: 'x' | 'y') => {
    const highlighted = isHighlightedAxisTick(tick, axis);
    return highlighted ? { ...style.tickStyle, fill: highlightTickFill } : style.tickStyle;
  };

  const formatTick = (value: number, axis: typeof chapter.xAxis) =>
    axis.format ? axis.format(value) : formatAxisTick(value, axis.tickFormat);

  const toPx = (point: { x: number; y: number }) => ({
    x: scales.xScale(point.x),
    y: scales.yScale(point.y),
  });

  const exploreAccent = style.resolveColor('explore');

  const morphPairs = useMemo(
    () =>
      chapter.curves
        .filter((curve) => curve.morphFromCurveId)
        .map((target) => ({
          target,
          source: chapter.curves.find((curve) => curve.id === target.morphFromCurveId),
        }))
        .filter((pair): pair is { source: (typeof chapter.curves)[0]; target: (typeof chapter.curves)[0] } =>
          Boolean(pair.source)
        ),
    [chapter.curves]
  );

  const activeMorph = useMemo(() => {
    if (mode !== 'build' || !activeStep) return null;
    return (
      morphPairs.find(
        (pair) =>
          activeStep.visibleLayers?.includes(pair.source.id) &&
          activeStep.visibleLayers?.includes(pair.target.id)
      ) ?? null
    );
  }, [mode, activeStep, morphPairs]);

  const [morphProgress, setMorphProgress] = useState(1);
  const previousBuildStep = useRef<BuildStep | undefined>();

  useEffect(() => {
    if (!activeMorph || mode !== 'build') {
      setMorphProgress(1);
      previousBuildStep.current = activeStep;
      return;
    }

    const targetId = activeMorph.target.id;
    const hadTarget = previousBuildStep.current?.visibleLayers?.includes(targetId);
    const hasTarget = activeStep?.visibleLayers?.includes(targetId);
    previousBuildStep.current = activeStep;

    if (!hasTarget) {
      setMorphProgress(1);
      return;
    }
    if (hadTarget) {
      return;
    }

    setMorphProgress(0);
    const controls = animate(0, 1, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: setMorphProgress,
    });
    return () => controls.stop();
  }, [activeMorph, activeStep, mode]);

  const visibleArrows = useMemo(
    () => chapter.graphArrows?.filter((arrow) => visibleArrowIds.includes(arrow.id)) ?? [],
    [chapter.graphArrows, visibleArrowIds]
  );
  const behindCurveIds = useMemo(
    () => new Set(visibleArrows.map((arrow) => arrow.belowCurveId).filter(Boolean) as string[]),
    [visibleArrows]
  );
  const arrowsBehindCurves = useMemo(
    () => visibleArrows.filter((arrow) => arrow.belowCurveId),
    [visibleArrows]
  );
  const arrowsInFront = useMemo(
    () => visibleArrows.filter((arrow) => !arrow.belowCurveId),
    [visibleArrows]
  );
  const curvesUnderArrows = useMemo(
    () => displayCurves.filter((curve) => !behindCurveIds.has(curve.id)),
    [displayCurves, behindCurveIds]
  );
  const curvesOverArrows = useMemo(
    () => displayCurves.filter((curve) => behindCurveIds.has(curve.id)),
    [displayCurves, behindCurveIds]
  );

  const renderCurve = (curve: (typeof displayCurves)[0]) => {
    const curveStyle = style.curves.get(curve.id);
    if (!curveStyle) return null;

    const isSlidingIn =
      activeMorph &&
      curve.id === activeMorph.target.id &&
      morphProgress < 1 &&
      activeMorph.source.params.points &&
      curve.params.points;

    const renderCurveSpec = isSlidingIn
      ? {
          ...curve,
          params: {
            ...curve.params,
            points: interpolateCurvePoints(
              activeMorph.source.params.points ?? [],
              curve.params.points ?? [],
              morphProgress
            ),
          },
        }
      : curve;

    const priorBuildLayers = previousBuildStep.current?.visibleLayers ?? [];
    const curveAlreadyRevealed =
      mode === 'build' && priorBuildLayers.includes(curve.id);
    const useDrawAnimation =
      Boolean(curveStyle.animated) &&
      !(activeMorph && curve.id === activeMorph.target.id) &&
      !curveAlreadyRevealed;

    return (
      <motion.path
        key={isSlidingIn ? `${curve.id}-slide` : curve.id}
        d={curvePath(renderCurveSpec, chapter, scales)}
        fill="none"
        stroke={curveStyle.stroke}
        strokeWidth={curveStyle.strokeWidth}
        strokeLinecap={curveStyle.strokeLinecap}
        strokeDasharray={curveStyle.strokeDasharray}
        initial={{ pathLength: useDrawAnimation ? 0 : 1 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: useDrawAnimation ? 1.4 : 0.3, ease: 'easeOut' }}
      />
    );
  };

  const renderGraphArrow = (arrow: GraphArrowSpec) => {
    const endpoints = resolveGraphArrowEndpoints(arrow, displayCurves);
    const curved = arrow.followCurveId
      ? buildCurvedArrowGeometry(
          chapter,
          arrow.followCurveId,
          endpoints.from,
          endpoints.to,
          scales,
          displayCurves
        )
      : null;
    const arrowFill = resolveArrowStroke(style, arrow);

    return (
      <GraphArrow
        key={arrow.id}
        arrow={arrow}
        from={toPx(endpoints.from)}
        to={toPx(endpoints.to)}
        curved={curved ?? undefined}
        theme={theme}
        fill={arrowFill}
        borderStroke={resolveArrowBorder(style, arrow, arrowFill)}
        strokeGradient={resolveArrowGradient(style, arrow)}
        calloutFill={resolveCalloutFill(style, arrow)}
        labelStyle={style.calloutStyle}
        labelOffset={arrow.labelOffset ? toPx(arrow.labelOffset) : undefined}
      />
    );
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <svg width={width} height={height} className="block w-full" style={{ fontFamily: theme.typography.fontFamily }}>
        <rect
          width={width}
          height={height}
          fill={layout.background}
          rx={layout.borderRadius}
        />
        <defs>
          <marker
            id="graph-arrow-outline"
            markerWidth={theme.arrow.headLength}
            markerHeight={theme.arrow.headWidth}
            refX={theme.arrow.headLength}
            refY={theme.arrow.headWidth / 2}
            orient="auto"
          >
            <polygon
              points={`0 0, ${theme.arrow.headLength} ${theme.arrow.headWidth / 2}, 0 ${theme.arrow.headWidth}`}
              fill={theme.arrow.outlineColor}
            />
          </marker>
        </defs>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <line x1={0} y1={plotTop} x2={0} y2={plotBottom} stroke={theme.colors.axis} strokeWidth={2} />
          <line
            x1={0}
            y1={plotBottom}
            x2={plotWidth}
            y2={plotBottom}
            stroke={theme.colors.axis}
            strokeWidth={2}
          />

          {xTicks.map((tick) => (
            <g key={`xlabel-${tick}`}>
              {!isHighlightedAxisTick(tick, 'x') ? (
                <line
                  x1={scales.xScale(tick)}
                  y1={plotBottom}
                  x2={scales.xScale(tick)}
                  y2={plotBottom + 8}
                  stroke={theme.colors.axis}
                  strokeWidth={1}
                />
              ) : null}
              <text
                x={scales.xScale(tick)}
                y={plotBottom + 22}
                textAnchor="middle"
                {...tickLabelStyle(tick, 'x')}
              >
                {formatTick(tick, chapter.xAxis)}
              </text>
            </g>
          ))}

          {yTicks.map((tick) => (
            <g key={`ylabel-${tick}`}>
              {!isHighlightedAxisTick(tick, 'y') ? (
                <line
                  x1={-8}
                  y1={scales.yScale(tick)}
                  x2={0}
                  y2={scales.yScale(tick)}
                  stroke={theme.colors.axis}
                  strokeWidth={1}
                />
              ) : null}
              <text
                x={-12}
                y={scales.yScale(tick) + 4}
                textAnchor="end"
                {...tickLabelStyle(tick, 'y')}
              >
                {formatTick(tick, chapter.yAxis)}
              </text>
            </g>
          ))}

          {curvesUnderArrows.map(renderCurve)}
          {arrowsBehindCurves.map(renderGraphArrow)}
          {curvesOverArrows.map(renderCurve)}
          {arrowsInFront.map(renderGraphArrow)}

          {supplyDemandExploreIllustration ? (
            <>
              <line
                x1={0}
                y1={scales.yScale(supplyDemandExploreIllustration.price)}
                x2={plotWidth}
                y2={scales.yScale(supplyDemandExploreIllustration.price)}
                stroke={theme.colors.axis}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <line
                x1={scales.xScale(supplyDemandExploreIllustration.demand.x)}
                y1={scales.yScale(supplyDemandExploreIllustration.demand.y)}
                x2={scales.xScale(supplyDemandExploreIllustration.demand.x)}
                y2={plotBottom}
                stroke={exploreAccent}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={scales.xScale(supplyDemandExploreIllustration.demand.x)}
                cy={scales.yScale(supplyDemandExploreIllustration.demand.y)}
                r={5}
                fill={exploreAccent}
              />
              <line
                x1={scales.xScale(supplyDemandExploreIllustration.supply.x)}
                y1={scales.yScale(supplyDemandExploreIllustration.supply.y)}
                x2={scales.xScale(supplyDemandExploreIllustration.supply.x)}
                y2={plotBottom}
                stroke={exploreAccent}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={scales.xScale(supplyDemandExploreIllustration.supply.x)}
                cy={scales.yScale(supplyDemandExploreIllustration.supply.y)}
                r={5}
                fill={exploreAccent}
              />
            </>
          ) : null}

          {elasticityExploreData ? (
            <>
              <circle
                cx={scales.xScale(elasticityExploreData.initialPoint.q)}
                cy={scales.yScale(elasticityExploreData.initialPoint.p)}
                r={5}
                fill={style.resolveColor('demand')}
              />
              <line
                x1={scales.xScale(elasticityExploreData.initialPoint.q)}
                y1={scales.yScale(elasticityExploreData.initialPoint.p)}
                x2={scales.xScale(elasticityExploreData.newPoint.q)}
                y2={scales.yScale(elasticityExploreData.newPoint.p)}
                stroke={style.resolveColor('supplyInitial')}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <circle
                cx={scales.xScale(elasticityExploreData.newPoint.q)}
                cy={scales.yScale(elasticityExploreData.newPoint.p)}
                r={5}
                fill={style.resolveColor('supplyInitial')}
              />
            </>
          ) : null}

          {chapter.curveLabels?.map((label) => {
            const showOnStep =
              usesStepSnapshot && stepSnapshot?.visibleLayers?.includes(label.curveId);
            const hideDuringMorph =
              activeMorph && morphProgress < 1 && label.curveId === activeMorph.target.id;
            if (!showOnStep || hideDuringMorph) return null;
            return (
              <text
                key={label.curveId}
                x={scales.xScale(label.x + (label.offsetX ?? 0))}
                y={scales.yScale(label.y + (label.offsetY ?? 0))}
                textAnchor={label.anchor ?? 'end'}
                {...style.curveLabelStyle}
              >
                {label.text}
              </text>
            );
          })}

          {showEquilibriumGuides
            ? equilibriaToRender.map((equilibrium) => {
                const applyGuideOverrides = usesStepSnapshot && mode !== 'explore';
                const pointIds =
                  (applyGuideOverrides && stepSnapshot?.visibleEquilibriumPoints) ||
                  equilibriaToRender.map((entry) => entry.id);
                const priceGuideIds =
                  (applyGuideOverrides && stepSnapshot?.priceGuideEquilibria) ||
                  (showPriceLine ? equilibriaToRender.map((entry) => entry.id) : []);
                const quantityGuideIds =
                  (applyGuideOverrides && stepSnapshot?.quantityGuideEquilibria) ||
                  (showQuantityLine ? equilibriaToRender.map((entry) => entry.id) : []);
                const showPoint = pointIds.includes(equilibrium.id);
                const showPriceGuide = priceGuideIds.includes(equilibrium.id);
                const showQuantityGuide = quantityGuideIds.includes(equilibrium.id);

                return (
                  <g key={equilibrium.id}>
                    {theme.equilibrium.showPoints && showPoint ? (
                      <circle
                        cx={scales.xScale(equilibrium.point.x)}
                        cy={scales.yScale(equilibrium.point.y)}
                        r={theme.equilibrium.pointRadius}
                        fill={equilibrium.color ?? theme.equilibrium.pointFill}
                        stroke={theme.equilibrium.pointStroke}
                        strokeWidth={theme.equilibrium.pointStrokeWidth}
                      />
                    ) : null}
                    {showPriceGuide ? (
                      <line
                        x1={0}
                        y1={scales.yScale(equilibrium.point.y)}
                        x2={scales.xScale(equilibrium.point.x)}
                        y2={scales.yScale(equilibrium.point.y)}
                        stroke={equilibrium.color}
                        strokeWidth={theme.equilibrium.guideStrokeWidth}
                        strokeDasharray={theme.equilibrium.guideDasharray}
                      />
                    ) : null}
                    {showQuantityGuide ? (
                      <line
                        x1={scales.xScale(equilibrium.point.x)}
                        y1={plotBottom}
                        x2={scales.xScale(equilibrium.point.x)}
                        y2={scales.yScale(equilibrium.point.y)}
                        stroke={equilibrium.color}
                        strokeWidth={theme.equilibrium.guideStrokeWidth}
                        strokeDasharray={theme.equilibrium.guideDasharray}
                      />
                    ) : null}
                  </g>
                );
              })
            : null}
        </g>

        <text
          x={margin.left + plotWidth}
          y={height - 18}
          textAnchor="end"
          {...style.axisTitleStyle}
        >
          {chapter.xAxis.label}
        </text>
        {chapter.yAxis.titleAboveMaxTick ? (
          <text
            x={margin.left + (chapter.yAxis.titleOffsetX ?? -8)}
            y={margin.top + scales.yScale(chapter.yAxis.max) + (chapter.yAxis.titleOffsetY ?? -14)}
            textAnchor="start"
            transform={
              chapter.yAxis.titleRotation
                ? `rotate(${chapter.yAxis.titleRotation} ${margin.left + (chapter.yAxis.titleOffsetX ?? -8)} ${margin.top + scales.yScale(chapter.yAxis.max) + (chapter.yAxis.titleOffsetY ?? -14)})`
                : undefined
            }
            {...style.axisTitleStyle}
          >
            {chapter.yAxis.label}
          </text>
        ) : (
          <text
            x={margin.left + (chapter.yAxis.titleOffsetX ?? 20)}
            y={margin.top + plotTop + plotHeight / 2}
            transform={`rotate(${chapter.yAxis.titleRotation ?? -90} ${margin.left + (chapter.yAxis.titleOffsetX ?? 20)} ${margin.top + plotTop + plotHeight / 2})`}
            textAnchor="middle"
            {...style.axisTitleStyle}
          >
            {chapter.yAxis.label}
          </text>
        )}
      </svg>
    </motion.div>
  );
};

export default GraphCanvas;
