import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChapterConfig, StageMode, BuildStep } from '../../engine/types';
import { createScales, curvePath, findEquilibrium } from '../../engine/graphEngine';
import { renderExploreIllustration } from '../../engine/strategies/supplyDemandStrategy';
import { getElasticityScenario, calculateElasticityPoint } from '../../engine/strategies/elasticityStrategy';

interface GraphCanvasProps {
  chapter: ChapterConfig;
  mode?: StageMode;
  activeStep?: BuildStep;
  exploreValues?: Record<string, number | boolean>;
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({ chapter, mode = 'book', activeStep, exploreValues }) => {
  const width = 760;
  const height = 420;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const scales = useMemo(() => createScales(chapter.xAxis, chapter.yAxis, innerWidth, innerHeight), [chapter, innerWidth, innerHeight]);
  const xDomain: [number, number] = [chapter.xAxis.min, chapter.xAxis.max];

  // Filter curves based on build step visibility or default visibility
  const curves = useMemo(() => {
    if (mode === 'build') {
      return activeStep?.visibleLayers
        ? chapter.curves.filter((curve) => activeStep.visibleLayers?.includes(curve.id))
        : [];
    }
    return chapter.curves.filter((curve) => curve.visible !== false);
  }, [chapter.curves, mode, activeStep]);

  const equilibrium = useMemo(
    () => chapter.equilibriumPoint ?? findEquilibrium(curves),
    [chapter.equilibriumPoint, curves]
  );

  // Supply-demand specific explore handling
  const showSurplus = mode === 'explore' && exploreValues?.surplus === true;
  const showShortage = mode === 'explore' && exploreValues?.shortage === true;
  
  const supplyDemandExploreIllustration = useMemo(() => {
    if (chapter.graphType !== 'supply-demand') return null;
    if (!showSurplus && !showShortage) return null;
    
    const scenario = chapter.exploreScenarios?.find(
      (s) => (showSurplus && s.id === 'surplus') || (showShortage && s.id === 'shortage')
    );
    if (!scenario) return null;
    
    return renderExploreIllustration(scenario, chapter);
  }, [chapter, showSurplus, showShortage]);

  // Elasticity specific explore handling
  const elasticityLevel = mode === 'explore' ? (exploreValues?.elasticity ?? 0) : -1;
  const showPriceChange = mode === 'explore' && exploreValues?.showPriceChange === true;
  
  const elasticityExploreData = useMemo(() => {
    if (chapter.graphType !== 'elasticity' || (elasticityLevel as number) < 0) return null;
    const scenario = getElasticityScenario(elasticityLevel as number);
    return showPriceChange ? calculateElasticityPoint(scenario) : null;
  }, [chapter.graphType, elasticityLevel, showPriceChange]);

  // Use all ticks if defined, otherwise generate 11 ticks
  const xTicks = chapter.xAxis.ticks || Array.from({ length: 11 }, (_, i) => chapter.xAxis.min + (chapter.xAxis.max - chapter.xAxis.min) * i / 10);
  const yTicks = chapter.yAxis.ticks || Array.from({ length: 11 }, (_, i) => chapter.yAxis.min + (chapter.yAxis.max - chapter.yAxis.min) * i / 10);

  return (
    <div className="relative">
      <svg width={width} height={height} className="block w-full">
        <rect width={width} height={height} fill="#ffffff" rx="28" />
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Axes */}
          <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#334155" strokeWidth={2} />
          <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#334155" strokeWidth={2} />
          
          {/* X-axis ticks and labels */}
          {xTicks.map((tick) => (
            <g key={`xlabel-${tick}`}>
              <line
                x1={scales.xScale(tick)}
                y1={innerHeight}
                x2={scales.xScale(tick)}
                y2={innerHeight + 8}
                stroke="#334155"
                strokeWidth={1}
              />
              <text
                x={scales.xScale(tick)}
                y={innerHeight + 25}
                textAnchor="middle"
                fontSize={12}
                fill="#475569"
                fontWeight="500"
              >
                {typeof tick === 'number' ? tick.toFixed(0) : tick}
              </text>
            </g>
          ))}
          
          {/* Y-axis ticks and labels */}
          {yTicks.map((tick) => (
            <g key={`ylabel-${tick}`}>
              <line
                x1={-8}
                y1={scales.yScale(tick)}
                x2={0}
                y2={scales.yScale(tick)}
                stroke="#334155"
                strokeWidth={1}
              />
              <text
                x={-15}
                y={scales.yScale(tick) + 4}
                textAnchor="end"
                fontSize={12}
                fill="#475569"
                fontWeight="500"
              >
                {typeof tick === 'number' ? tick.toFixed(0) : tick}
              </text>
            </g>
          ))}

          {/* Curve paths */}
          {curves.map((curve) => (
            <motion.path
              key={curve.id}
              d={curvePath(curve, xDomain, scales)}
              fill="none"
              stroke={curve.color ?? '#0f172a'}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: curve.animated ? 1.4 : 0.3, ease: 'easeOut' }}
            />
          ))}

          {supplyDemandExploreIllustration ? (
            <>
              <line
                x1={0}
                y1={scales.yScale(supplyDemandExploreIllustration.price)}
                x2={innerWidth}
                y2={scales.yScale(supplyDemandExploreIllustration.price)}
                stroke="#475569"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <line
                x1={scales.xScale(supplyDemandExploreIllustration.demand.x)}
                y1={scales.yScale(supplyDemandExploreIllustration.demand.y)}
                x2={scales.xScale(supplyDemandExploreIllustration.demand.x)}
                y2={innerHeight}
                stroke="#0f172a"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={scales.xScale(supplyDemandExploreIllustration.demand.x)}
                cy={scales.yScale(supplyDemandExploreIllustration.demand.y)}
                r={6}
                fill="#0f172a"
              />
              <text
                x={scales.xScale(supplyDemandExploreIllustration.demand.x) - 6}
                y={scales.yScale(supplyDemandExploreIllustration.demand.y) - 10}
                textAnchor="end"
                fill="#0f172a"
                fontSize={12}
                fontWeight="700"
              >
                Qd
              </text>
              <line
                x1={scales.xScale(supplyDemandExploreIllustration.supply.x)}
                y1={scales.yScale(supplyDemandExploreIllustration.supply.y)}
                x2={scales.xScale(supplyDemandExploreIllustration.supply.x)}
                y2={innerHeight}
                stroke="#0f172a"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <circle
                cx={scales.xScale(supplyDemandExploreIllustration.supply.x)}
                cy={scales.yScale(supplyDemandExploreIllustration.supply.y)}
                r={6}
                fill="#0f172a"
              />
              <text
                x={scales.xScale(supplyDemandExploreIllustration.supply.x) + 6}
                y={scales.yScale(supplyDemandExploreIllustration.supply.y) - 10}
                textAnchor="start"
                fill="#0f172a"
                fontSize={12}
                fontWeight="700"
              >
                Qs
              </text>
            </>
          ) : null}

          {elasticityExploreData ? (
            <>
              <circle
                cx={scales.xScale(elasticityExploreData.initialPoint.q)}
                cy={scales.yScale(elasticityExploreData.initialPoint.p)}
                r={6}
                fill="#10b981"
              />
              <text
                x={scales.xScale(elasticityExploreData.initialPoint.q) + 10}
                y={scales.yScale(elasticityExploreData.initialPoint.p)}
                textAnchor="start"
                fill="#0f172a"
                fontSize={12}
                fontWeight="700"
              >
                Initial
              </text>
              <line
                x1={scales.xScale(elasticityExploreData.initialPoint.q)}
                y1={scales.yScale(elasticityExploreData.initialPoint.p)}
                x2={scales.xScale(elasticityExploreData.newPoint.q)}
                y2={scales.yScale(elasticityExploreData.newPoint.p)}
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <circle
                cx={scales.xScale(elasticityExploreData.newPoint.q)}
                cy={scales.yScale(elasticityExploreData.newPoint.p)}
                r={6}
                fill="#dc2626"
              />
              <text
                x={scales.xScale(elasticityExploreData.newPoint.q) + 10}
                y={scales.yScale(elasticityExploreData.newPoint.p)}
                textAnchor="start"
                fill="#0f172a"
                fontSize={12}
                fontWeight="700"
              >
                New
              </text>
            </>
          ) : null}

          {mode === 'build' && activeStep ? (
            <>
              {chapter.curveLabels?.map((label) => 
                activeStep.visibleLayers?.includes(label.curveId) ? (
                  <text
                    key={label.curveId}
                    x={scales.xScale(label.x)}
                    y={scales.yScale(label.y)}
                    textAnchor={label.curveId === 'demand' ? 'end' : 'end'}
                    fill="#0f172a"
                    fontSize={14}
                    fontWeight="700"
                  >
                    {label.text}
                  </text>
                ) : null
              )}
            </>
          ) : null}

          {/* Equilibrium visualization */}
          {equilibrium && !showSurplus && !showShortage && (mode !== 'build' || activeStep?.showEquilibrium) ? (
            <g>
              <circle cx={scales.xScale(equilibrium.x)} cy={scales.yScale(equilibrium.y)} r={8} fill={chapter.themeColor} />
              {mode !== 'build' || activeStep?.showPriceLine ? (
                <line
                  x1={0}
                  y1={scales.yScale(equilibrium.y)}
                  x2={scales.xScale(equilibrium.x)}
                  y2={scales.yScale(equilibrium.y)}
                  stroke={chapter.themeColor}
                  strokeWidth={2}
                  strokeDasharray="6 6"
                />
              ) : null}
              {mode !== 'build' || activeStep?.showQuantityLine ? (
                <line
                  x1={scales.xScale(equilibrium.x)}
                  y1={innerHeight}
                  x2={scales.xScale(equilibrium.x)}
                  y2={scales.yScale(equilibrium.y)}
                  stroke={chapter.themeColor}
                  strokeWidth={2}
                  strokeDasharray="6 6"
                />
              ) : null}
            </g>
          ) : null}
        </g>
        {/* Axis labels */}
        <text x={margin.left + innerWidth / 2} y={margin.top + innerHeight + 45} textAnchor="middle" fill="#475569" fontSize={14} fontWeight="600">
          {chapter.xAxis.label}
        </text>
        <text
          x={margin.left - 45}
          y={margin.top + innerHeight / 2}
          transform={`rotate(-90 ${margin.left - 45} ${margin.top + innerHeight / 2})`}
          textAnchor="middle"
          fill="#475569"
          fontSize={14}
          fontWeight="600"
        >
          {chapter.yAxis.label}
        </text>
      </svg>
    </div>
  );
};

export default GraphCanvas;
