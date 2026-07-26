import { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';

export default function CountUp({ value = 0, prefix = '', decimals = 0 }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: decimals })}`);
  const ref = useRef(null);

  useEffect(() => {
    const controls = animate(motionVal, Number(value) || 0, { duration: 1, ease: 'easeOut' });
    const unsub = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return () => { controls.stop(); unsub(); };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <span ref={ref}>{prefix}0</span>;
}
