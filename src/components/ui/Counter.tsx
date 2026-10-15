import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Counts up from a nearby value once visible. Years count from a few back so they still read as years. */
export function Counter({ value, suffix = '', isYear = false }: { value: number; suffix?: string; isYear?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const start = isYear ? value - 20 : 0;
  const [display, setDisplay] = useState(reduce ? value : start);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(start, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, start, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}
