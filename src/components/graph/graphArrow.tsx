import React from 'react';
import { GraphThemeConfig } from '../../config/graphThemes/types';
import { GraphArrowSpec } from '../../engine/types';
import { ResolvedTextStyle } from '../../engine/resolveGraphStyle';

interface Point {
  x: number;
  y: number;
}

const normalize = (from: Point, to: Point) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  return { dx: dx / length, dy: dy / length, length };
};

const tipPoint = (to: Point, dir: { dx: number; dy: number }, headLength: number): Point => ({
  x: to.x - dir.dx * headLength,
  y: to.y - dir.dy * headLength,
});

export const buildArrowGeometry = (
  from: Point,
  to: Point,
  theme: GraphThemeConfig['arrow']
): { shaft: { x1: number; y1: number; x2: number; y2: number }; head: string } => {
  const dir = normalize(from, to);
  const tip = tipPoint(to, dir, theme.headLength);
  const half = theme.headWidth / 2;
  const left = {
    x: to.x - dir.dx * theme.headLength + -dir.dy * half,
    y: to.y - dir.dy * theme.headLength + dir.dx * half,
  };
  const right = {
    x: to.x - dir.dx * theme.headLength + dir.dy * half,
    y: to.y - dir.dy * theme.headLength + -dir.dx * half,
  };
  return {
    shaft: { x1: from.x, y1: from.y, x2: tip.x, y2: tip.y },
    head: `M ${to.x} ${to.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`,
  };
};

interface GraphArrowProps {
  arrow: GraphArrowSpec;
  from: Point;
  to: Point;
  theme: GraphThemeConfig;
  fill: string;
  labelStyle: ResolvedTextStyle;
  calloutFill: string;
  labelOffset?: Point;
}

export const GraphArrow: React.FC<GraphArrowProps> = ({
  arrow,
  from,
  to,
  theme,
  fill,
  labelStyle,
  calloutFill,
  labelOffset,
}) => {
  const geometry = buildArrowGeometry(from, to, theme.arrow);
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const labelX = labelOffset?.x ?? mid.x;
  const labelY = labelOffset?.y ?? mid.y;
  const lines = arrow.label.split('\n');
  const lineHeight = labelStyle.fontSize + 2;
  const boxHeight = lines.length * lineHeight + theme.callout.paddingY * 2;
  const maxLineWidth = Math.max(...lines.map((line) => line.length * (labelStyle.fontSize * 0.55)));
  const boxWidth = maxLineWidth + theme.callout.paddingX * 2;
  const textAnchor = theme.callout.textAlign === 'left' ? 'start' : 'middle';
  const textX = theme.callout.textAlign === 'left' ? theme.callout.paddingX : boxWidth / 2;

  return (
    <g>
      <line
        {...geometry.shaft}
        stroke={theme.arrow.outlineColor}
        strokeWidth={theme.arrow.outlineWidth}
        strokeLinecap="round"
      />
      <line {...geometry.shaft} stroke={fill} strokeWidth={theme.arrow.shaftWidth} strokeLinecap="round" />
      <path
        d={geometry.head}
        fill={theme.arrow.outlineColor}
        stroke={theme.arrow.outlineColor}
        strokeWidth={1}
      />
      <path d={geometry.head} fill={fill} stroke="none" />
      <g transform={`translate(${labelX - boxWidth / 2}, ${labelY - boxHeight / 2})`}>
        <rect
          width={boxWidth}
          height={boxHeight}
          rx={theme.callout.borderRadius}
          fill={calloutFill}
          stroke={theme.callout.borderColor}
          strokeWidth={theme.callout.borderWidth}
        />
        {lines.map((line, index) => (
          <text
            key={`${arrow.id}-line-${index}`}
            x={textX}
            y={theme.callout.paddingY + labelStyle.fontSize + index * lineHeight}
            textAnchor={textAnchor}
            fontFamily={labelStyle.fontFamily}
            fontSize={labelStyle.fontSize}
            fontWeight={labelStyle.fontWeight}
            fontStyle={labelStyle.fontStyle}
            fill={labelStyle.fill}
          >
            {line}
          </text>
        ))}
      </g>
    </g>
  );
};
