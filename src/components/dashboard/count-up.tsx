"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
}

export function CountUp({ value, duration = 700, className }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (reduceMotion || value === previous.current) {
        setDisplay(value);
        previous.current = value;
        return;
      }
      const start = previous.current;
      const diff = value - start;
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(start + diff * eased));
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          previous.current = value;
        }
      };
      requestAnimationFrame(animate);
    });
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduceMotion]);

  return <span className={className}>{display}</span>;
}