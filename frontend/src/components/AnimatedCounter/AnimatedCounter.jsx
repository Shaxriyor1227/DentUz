import React, { useState, useEffect, useRef } from 'react';
import { useInView } from '../../hooks/useInView';

/**
 * Animated number counter component.
 * Counts up smoothly from 0 to the target value when it enters the viewport.
 * Supports numbers, percentages, plus suffixes, and formatted thousand separators.
 *
 * @param {Object} props
 * @param {string|number} props.value - The final target value (e.g. "140+", "99.8%", "12 500+")
 * @param {number} [props.duration=1000] - Duration of the count-up animation in ms
 * @param {string} [props.className] - Optional class name
 */
export default function AnimatedCounter({
  value,
  target,
  duration = 1000,
  decimals,
  className = '',
}) {
  const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true });
  const valToUse = value !== undefined ? value : (target !== undefined ? target : 0);
  const rawString = String(valToUse);

  // Parse suffix (e.g. "+", "%")
  const hasPlus = rawString.includes('+');
  const hasPercent = rawString.includes('%');
  const hasSpaceSep = rawString.includes(' ');

  // Extract clean numerical float
  const numericMatch = rawString.replace(/\s+/g, '').match(/[\d.,]+/);
  const cleanNumberStr = numericMatch ? numericMatch[0].replace(',', '.') : '0';
  const targetNumber = parseFloat(cleanNumberStr) || 0;
  const isDecimal = cleanNumberStr.includes('.') || decimals !== undefined;
  const decimalPlaces = decimals !== undefined ? decimals : (cleanNumberStr.includes('.') ? cleanNumberStr.split('.')[1].length : 0);

  const [displayValue, setDisplayValue] = useState(0);
  const animatedRef = useRef(false);

  useEffect(() => {
    // Respect reduced motion
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setDisplayValue(targetNumber);
        return;
      }
    }

    if (!inView || animatedRef.current) return;
    animatedRef.current = true;

    const startTime = performance.now();

    const frame = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = targetNumber * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setDisplayValue(targetNumber);
      }
    };

    requestAnimationFrame(frame);
  }, [inView, targetNumber, duration]);

  // Format current value
  let formattedNumber = isDecimal
    ? displayValue.toFixed(decimalPlaces)
    : Math.round(displayValue).toString();

  if (hasSpaceSep || targetNumber >= 1000) {
    // Insert spaces as thousand separators (e.g. 45 000)
    formattedNumber = formattedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  const resultString = `${formattedNumber}${hasPercent ? '%' : ''}${hasPlus ? '+' : ''}`;

  return (
    <span ref={ref} className={className}>
      {resultString}
    </span>
  );
}
