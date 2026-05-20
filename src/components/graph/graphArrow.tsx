import React from 'react';
import { GraphThemeConfig } from '../../config/graphThemes/types';
import { GraphArrowSpec } from '../../engine/types';
import { CurvedArrowGeometry } from '../../engine/graphEngine';
import { ResolvedArrowGradient, ResolvedTextStyle } from '../../engine/resolveGraphStyle';

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

const offsetPoint = (base: Point, dir: { dx: number; dy: number }, distance: number, side: 1 | -1): Point => ({
  x: base.x + -dir.dy * distance * side,
  y: base.y + dir.dx * distance * side,
});

/** Nearest point on callout box border toward `target`. */
const nearestBoxEdgePoint = (
  target: Point,
  left: number,
  top: number,
  right: number,
  bottom: number
): Point => {
  const x = Math.max(left, Math.min(target.x, right));
  const y = Math.max(top, Math.min(target.y, bottom));
  if (target.x >= left && target.x <= right && target.y >= top && target.y <= bottom) {
    const toLeft = target.x - left;
    const toRight = right - target.x;
    const toTop = target.y - top;
    const toBottom = bottom - target.y;
    const min = Math.min(toLeft, toRight, toTop, toBottom);
    if (min === toLeft) return { x: left, y: target.y };
    if (min === toRight) return { x: right, y: target.y };
    if (min === toTop) return { x: target.x, y: top };
    return { x: target.x, y: bottom };
  }
  return { x, y };
};

/** Nearest point on arrow shaft outline (capsule) toward `target`. */
const nearestArrowBorderPoint = (target: Point, tail: Point, tip: Point, radius: number): Point => {
  const dx = tip.x - tail.x;
  const dy = tip.y - tail.y;
  const lenSq = dx * dx + dy * dy || 1;
  let t = ((target.x - tail.x) * dx + (target.y - tail.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = tail.x + t * dx;
  const cy = tail.y + t * dy;
  const distX = target.x - cx;
  const distY = target.y - cy;
  const dist = Math.hypot(distX, distY) || 1;
  return {
    x: cx + (distX / dist) * radius,
    y: cy + (distY / dist) * radius,
  };
};

/** Single filled outline: shaft + head as one shape (no separate spine/head layers). */
export const buildUnitedArrowPath = (
  from: Point,
  to: Point,
  bodyWidth: number,
  headLength: number,
  headWidth: number
): string => {
  const dir = normalize(from, to);
  const tip = tipPoint(to, dir, headLength);
  const halfBody = bodyWidth / 2;
  const halfHead = headWidth / 2;

  const shaftLeftStart = offsetPoint(from, dir, halfBody, 1);
  const shaftRightStart = offsetPoint(from, dir, halfBody, -1);
  const shaftLeftTip = offsetPoint(tip, dir, halfBody, 1);
  const shaftRightTip = offsetPoint(tip, dir, halfBody, -1);
  const headLeft = offsetPoint(tip, dir, halfHead, 1);
  const headRight = offsetPoint(tip, dir, halfHead, -1);

  return [
    `M ${shaftLeftStart.x} ${shaftLeftStart.y}`,
    `L ${shaftLeftTip.x} ${shaftLeftTip.y}`,
    `L ${headLeft.x} ${headLeft.y}`,
    `L ${to.x} ${to.y}`,
    `L ${headRight.x} ${headRight.y}`,
    `L ${shaftRightTip.x} ${shaftRightTip.y}`,
    `L ${shaftRightStart.x} ${shaftRightStart.y}`,
    'Z',
  ].join(' ');
};

export const buildArrowGeometry = (
  from: Point,
  to: Point,
  theme: GraphThemeConfig['arrow']
): { shaft: { x1: number; y1: number; x2: number; y2: number }; head: string } => {
  const dir = normalize(from, to);
  const tip = tipPoint(to, dir, theme.headLength);
  const half = theme.headWidth / 2;
  const left = offsetPoint(tip, dir, half, 1);
  const right = offsetPoint(tip, dir, half, -1);
  return {
    shaft: { x1: from.x, y1: from.y, x2: tip.x, y2: tip.y },
    head: `M ${to.x} ${to.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`,
  };
};

interface GraphArrowProps {
  arrow: GraphArrowSpec;
  from: Point;
  to: Point;
  curved?: CurvedArrowGeometry;
  theme: GraphThemeConfig;
  fill: string;
  strokeGradient?: ResolvedArrowGradient;
  labelStyle: ResolvedTextStyle;
  calloutFill: string;
  labelOffset?: Point;
}

export const GraphArrow: React.FC<GraphArrowProps> = ({
  arrow,
  from,
  to,
  curved,
  theme,
  fill,
  strokeGradient,
  labelStyle,
  calloutFill,
  labelOffset,
}) => {
  const thickness = arrow.thicknessScale ?? 1;
  const arrowStyle = {
    bodyWidth: theme.arrow.outlineWidth * thickness,
    headLength: theme.arrow.headLength * thickness,
    headWidth: theme.arrow.headWidth * thickness,
  };
  const headFrom = curved?.headFrom ?? from;
  const headTo = curved?.headTo ?? to;
  const unitedHeadPath = buildUnitedArrowPath(
    headFrom,
    headTo,
    arrowStyle.bodyWidth,
    arrowStyle.headLength,
    arrowStyle.headWidth
  );
  const gradientId = `arrow-gradient-${arrow.id}`;
  const strokePaint = strokeGradient ? `url(#${gradientId})` : fill;
  const fillOpacity = theme.arrow.fillOpacity ?? 0.85;
  const borderWidth = (theme.arrow.borderWidth ?? 1) * thickness;
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const labelX = labelOffset?.x ?? mid.x;
  const labelY = labelOffset?.y ?? mid.y;
  const lines = arrow.label.split('\n');
  const lineHeight =
    theme.callout.lineHeight != null
      ? labelStyle.fontSize * theme.callout.lineHeight
      : labelStyle.fontSize + 2;
  const padLeft = theme.callout.paddingLeft ?? theme.callout.paddingX;
  const padRight = theme.callout.paddingRight ?? theme.callout.paddingX;
  const padTop = theme.callout.paddingTop ?? theme.callout.paddingY;
  const padBottom = theme.callout.paddingBottom ?? theme.callout.paddingY;
  const boxHeight = lines.length * lineHeight + padTop + padBottom;
  const maxLineWidth = Math.max(...lines.map((line) => line.length * (labelStyle.fontSize * 0.55)));
  const boxWidth = maxLineWidth + padLeft + padRight;
  const textAnchor = theme.callout.textAlign === 'left' ? 'start' : 'middle';
  const textX = theme.callout.textAlign === 'left' ? padLeft : boxWidth / 2;
  const boxLeft = labelX - boxWidth / 2;
  const boxTop = labelY - boxHeight / 2;
  const boxRight = labelX + boxWidth / 2;
  const boxBottom = labelY + boxHeight / 2;
  const connector = theme.callout.connector;
  const arrowMid = {
    x: (from.x + headTo.x) / 2,
    y: (from.y + headTo.y) / 2,
  };
  const connectorEnds =
    connector &&
    (() => {
      const boxEdge = nearestBoxEdgePoint(arrowMid, boxLeft, boxTop, boxRight, boxBottom);
      const arrowEdge = nearestArrowBorderPoint(boxEdge, from, headTo, arrowStyle.bodyWidth / 2);
      return { boxEdge, arrowEdge };
    })();

  return (
    <g>
      {strokeGradient ? (
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
          >
            <stop offset="0%" stopColor={strokeGradient.from} />
            <stop offset="100%" stopColor={strokeGradient.to} />
          </linearGradient>
        </defs>
      ) : null}
      {connector && connectorEnds ? (
        <line
          x1={connectorEnds.boxEdge.x}
          y1={connectorEnds.boxEdge.y}
          x2={connectorEnds.arrowEdge.x}
          y2={connectorEnds.arrowEdge.y}
          stroke={connector.stroke}
          strokeWidth={connector.strokeWidth}
        />
      ) : null}
      {curved ? (
        <path
          d={curved.shaftPath}
          fill="none"
          stroke={strokePaint}
          strokeWidth={arrowStyle.bodyWidth}
          strokeOpacity={fillOpacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      <path
        d={curved ? unitedHeadPath : buildUnitedArrowPath(from, to, arrowStyle.bodyWidth, arrowStyle.headLength, arrowStyle.headWidth)}
        fill={strokePaint}
        fillOpacity={fillOpacity}
        stroke={strokePaint}
        strokeWidth={borderWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g transform={`translate(${boxLeft}, ${boxTop})`}>
        {theme.callout.shadow ? (
          <rect
            x={-theme.callout.shadow.offsetX}
            y={-theme.callout.shadow.offsetY}
            width={boxWidth}
            height={boxHeight}
            rx={theme.callout.borderRadius}
            fill={theme.callout.shadow.color}
          />
        ) : null}
        <rect
          width={boxWidth}
          height={boxHeight}
          rx={theme.callout.borderRadius}
          fill={calloutFill}
          stroke={theme.callout.borderWidth > 0 ? theme.callout.borderColor : 'none'}
          strokeWidth={theme.callout.borderWidth}
        />
        {lines.map((line, index) => (
          <text
            key={`${arrow.id}-line-${index}`}
            x={textX}
            y={padTop + labelStyle.fontSize + index * lineHeight}
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
