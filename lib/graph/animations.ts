export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function interpolate(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function animateValue(
  startValue: number,
  endValue: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void
) {
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const easedT = easeInOut(t);
    const currentValue = interpolate(startValue, endValue, easedT);
    onUpdate(currentValue);
    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };
  animate();
}