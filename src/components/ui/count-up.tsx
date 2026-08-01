"use client";

import { useEffect, useRef } from "react";

const formatNumber = (value: number) => value.toLocaleString("fa-IR");

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * The running number is written straight to the DOM node instead of held in
 * state: an animation frame is an external system, so driving it through
 * setState would both trip React's cascading-render warning and re-render the
 * component ~60 times a second for text that only this node cares about.
 */
export function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Nothing to animate for someone who asked for less motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.textContent = formatNumber(value);
      return;
    }

    let frame = 0;
    let startTime = 0;
    const DURATION = 900;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const step = (now: number) => {
          if (!startTime) startTime = now;
          const progress = Math.min((now - startTime) / DURATION, 1);
          // easeOutCubic: fast at first, settling gently on the final number
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = formatNumber(Math.round(value * eased));
          if (progress < 1) frame = requestAnimationFrame(step);
        };

        element.textContent = formatNumber(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  // Rendered (and server-rendered) at its final value, so the real number is in
  // the HTML for crawlers and for anyone without JavaScript.
  return <span ref={ref}>{formatNumber(value)}</span>;
}
