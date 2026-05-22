import { useState, useEffect } from 'react';

/**
 * A hook that animates a numeric value from 0 to the target value over a specified duration.
 * Provides a highly premium, smooth "counting up" effect for metric cards.
 * @param targetValue The final number to count up to
 * @param durationMs How long the animation should take in milliseconds
 * @param formatFn Optional formatting function (e.g. for commas or decimal places)
 */
export function useAnimatedNumber(
  targetValue: number,
  durationMs: number = 800,
  formatFn: (val: number) => string = (val) => Math.floor(val).toString()
): string {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutExpo = (t: number): number => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      const easedProgress = easeOutExpo(progress);
      const nextValue = targetValue * easedProgress;

      setCurrentValue(nextValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, durationMs]);

  return formatFn(currentValue);
}
