'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

export function useCountUp(target: number, duration = 1.5) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [hasStarted, setHasStarted] = useState(false);
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const rounded = useTransform(spring, (v) => Math.round(v));

  useEffect(() => {
    if (inView && !hasStarted) {
      setHasStarted(true);
      spring.set(target);
    }
  }, [inView, hasStarted, spring, target]);

  return { ref, value: rounded };
}

export function CountUp({ target, suffix = '', className }: { target: number; suffix?: string; className?: string }) {
  const { ref, value } = useCountUp(target);

  return (
    <span className={className}>
      <motion.span ref={ref}>{value}</motion.span>
      {suffix}
    </span>
  );
}
