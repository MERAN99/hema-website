import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

type Props = {
  value: number;
  suffix?: string;
  isYear?: boolean;
  /** Seconds to wait after coming into view, e.g. until a parent's entrance animation has revealed the number. */
  delay?: number;
  duration?: number;
};

/** Counts up from a nearby value once visible. Years count from a few back so they still read as years. */
export function Counter({ value, suffix = '', isYear = false, delay = 0, duration = 1.6 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const start = isYear ? value - 20 : 0;
  const [display, setDisplay] = useState(reduce ? value : start);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(start, value, {
      duration,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, start, value, delay, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}
