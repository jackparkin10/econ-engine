import { scaleLinear } from 'd3-scale';
import { AxisConfig } from './types';

export function createXScale(axis: AxisConfig, width: number) {
  return scaleLinear()
    .domain([axis.min, axis.max])
    .range([0, width]);
}

export function createYScale(axis: AxisConfig, height: number) {
  return scaleLinear()
    .domain([axis.min, axis.max])
    .range([height, 0]); // SVG y=0 is top
}

export function scaleToScreen(xScale: any, yScale: any, point: { x: number; y: number }) {
  return {
    x: xScale(point.x),
    y: yScale(point.y),
  };
}

export function scaleFromScreen(xScale: any, yScale: any, point: { x: number; y: number }) {
  return {
    x: xScale.invert(point.x),
    y: yScale.invert(point.y),
  };
}