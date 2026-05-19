import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChapterConfig, StageMode, BuildStep } from '../../engine/types';
import {
  applyExploreBindings,
  createScales,
  curvePath,
  findEquilibrium,
  insertEquilibriumKnots,
  resolveEquilibria,
  type ResolvedEquilibrium,
} from '../../engine/graphEngine';
import {
  formatAxisTick,
  resolveChapterGraphStyle,
  resolveCalloutFill,
  resolveArrowStroke,
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

const GraphCanvas: React.FC<GraphCanvasProps> = ({ chapter, mode = 'book', activeStep, exploreValues }) => {
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
    if (mode === 'book' && chapter.bookLayers?.length) {
      return chapter.curves.filter((curve) => chapter.bookLayers?.includes(curve.id));
    }
    if (mode === 'build') {
      return activeStep?.visibleLayers
        ? chapter.curves.filter((curve) => activeStep.visibleLayers?.includes(curve.id))
        : [];
    }
    if (mode === 'explore' && chapter.exploreLayers?.length) {
      return chapter.curves.filter((curve) => chapter.exploreLayers?.includes(curve.id));
    }
    return chapter.curves.filter((curve) => curve.visible !== false);
  }, [chapter.curves, chapter.bookLayers, chapter.exploreLayers, mode, activeStep]);

  const showSurplus = mode === 'explore' && exploreValues?.surplus === true;
  const showShortage = mode === 'explore' && exploreValues?.shortage === true;

  const { displayCurves, equilibriaToRender } = useMemo(() => {
    const boundCurves = applyExploreBindings(chapter, baseCurves, exploreValues);

    if (showSurplus || showShortage) {
      return { displayCurves: boundCurves, equilibriaToRender: [] as ResolvedEquilibrium[] };
    }

    let resolved: ResolvedEquilibrium[] = [];

    if (chapter.equilibria?.length) {
      if (mode === 'explore') {
        resolved = resolveEquilibria(chapter, boundCurves);
      } else if (mode === 'build' && activeStep?.showEquilibrium) {
        const ids = activeStep.visibleEquilibria ?? chapter.equilibria.map((entry) => entry.id);
        resolved = resolveEquilibria(chapter, boundCurves, ids);
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
    activeStep,
    showSurplus,
    showShortage,
    style,
  ]);

  const showEquilibriumGuides = mode !== 'build' || Boolean(activeStep?.showEquilibrium);
  const showPriceLine = mode !== 'build' || Boolean(activeStep?.showPriceLine);
  const showQuantityLine = mode !== 'build' || Boolean(activeStep?.showQuantityLine);

  const visibleArrowIds = useMemo(() => {
    if (mode === 'build' && activeStep?.visibleAnnotations?.length) {
      return activeStep.visibleAnnotations;
    }
    if (mode === 'explore') {
      return chapter.graphArrows?.map((arrow) => arrow.id) ?? [];
    }
    return [];
  }, [mode, activeStep, chapter.graphArrows]);

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
  const yTicks =
    chapter.yAxis.ticks ||
    Array.from({ length: 11 }, (_, i) => chapter.yAxis.min + ((chapter.yAxis.max - chapter.yAxis.min) * i) / 10);

  const formatTick = (value: number, axis: typeof chapter.xAxis) =>
    axis.format ? axis.format(value) : formatAxisTick(value, axis.tickFormat);

  const toPx = (point: { x: number; y: number }) => ({
    x: scales.xScale(point.x),
    y: scales.yScale(point.y),
  });

  const exploreAccent = style.resolveColor('explore');

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
              <line
                x1={scales.xScale(tick)}
                y1={plotBottom}
                x2={scales.xScale(tick)}
                y2={plotBottom + 8}
                stroke={theme.colors.axis}
                strokeWidth={1}
              />
              <text
                x={scales.xScale(tick)}
                y={plotBottom + 22}
                textAnchor="middle"
                {...style.tickStyle}
              >
                {formatTick(tick, chapter.xAxis)}
              </text>
            </g>
          ))}

          {yTicks.map((tick) => (
            <g key={`ylabel-${tick}`}>
              <line
                x1={-8}
                y1={scales.yScale(tick)}
                x2={0}
                y2={scales.yScale(tick)}
                stroke={theme.colors.axis}
                strokeWidth={1}
              />
              <text
                x={-12}
                y={scales.yScale(tick) + 4}
                textAnchor="end"
                {...style.tickStyle}
              >
                {formatTick(tick, chapter.yAxis)}
              </text>
            </g>
          ))}

          {displayCurves.map((curve) => {
            const curveStyle = style.curves.get(curve.id);
            if (!curveStyle) return null;
            return (
              <motion.path
                key={curve.id}
                d={curvePath(curve, chapter, scales)}
                fill="none"
                stroke={curveStyle.stroke}
                strokeWidth={curveStyle.strokeWidth}
                strokeLinecap={curveStyle.strokeLinecap}
                strokeDasharray={curveStyle.strokeDasharray}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: curveStyle.animated ? 1.4 : 0.3, ease: 'easeOut' }}
              />
            );
          })}

          {chapter.graphArrows
            ?.filter((arrow) => visibleArrowIds.includes(arrow.id))
            .map((arrow) => (
              <GraphArrow
                key={arrow.id}
                arrow={arrow}
                from={toPx(arrow.from)}
                to={toPx(arrow.to)}
                theme={theme}
                fill={resolveArrowStroke(style, arrow)}
                calloutFill={resolveCalloutFill(style, arrow)}
                labelStyle={style.calloutStyle}
                labelOffset={arrow.labelOffset ? toPx(arrow.labelOffset) : undefined}
              />
            ))}

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
            const curveVisible = displayCurves.some((curve) => curve.id === label.curveId);
            const showInBuild = mode === 'build' && activeStep?.visibleLayers?.includes(label.curveId);
            const showInBook = mode === 'book' && curveVisible;
            if (!showInBuild && !showInBook) return null;
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
            ? equilibriaToRender.map((equilibrium) => (
                <g key={equilibrium.id}>
                  {theme.equilibrium.showPoints ? (
                    <circle
                      cx={scales.xScale(equilibrium.point.x)}
                      cy={scales.yScale(equilibrium.point.y)}
                      r={theme.equilibrium.pointRadius}
                      fill={equilibrium.color ?? theme.equilibrium.pointFill}
                      stroke={theme.equilibrium.pointStroke}
                      strokeWidth={theme.equilibrium.pointStrokeWidth}
                    />
                  ) : null}
                  {showPriceLine ? (
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
                  {showQuantityLine ? (
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
              ))
            : null}
        </g>

        <text
          x={margin.left + plotWidth / 2}
          y={height - 18}
          textAnchor="middle"
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
