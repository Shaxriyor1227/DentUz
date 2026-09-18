import { useState, useEffect, useRef } from 'react';

/**
 * Lightweight IntersectionObserver hook for scroll-reveal animations.
 * Triggers once by default. Immediately marks elements inside the initial viewport as visible on mount.
 *
 * @param {Object} [options]
 * @param {number} [options.threshold=0.15] - Intersection threshold (0.0 to 1.0)
 * @param {string} [options.rootMargin='0px 0px -40px 0px'] - Viewport margins
 * @param {boolean} [options.triggerOnce=true] - Whether to trigger only once
 * @returns {[import('react').RefObject, boolean]} - [ref, inView]
 */
export function useInView(options = {}) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -40px 0px',
    triggerOnce = true,
  } = options;

  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Respect user's motion preferences
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        setInView(true);
        return;
      }
    }

    const node = ref.current;
    if (!node) return;

    // Check if element is already within the visible viewport on initial load
    const rect = node.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top <= windowHeight && rect.bottom >= 0) {
      setInView(true);
      if (triggerOnce) return;
    }

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) {
            observer.unobserve(node);
          }
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, inView];
}

export default useInView;
