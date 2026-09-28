import { useEffect, useRef, useState } from 'react';

/**
 * Smooth countdown driven by requestAnimationFrame. Resets whenever `resetKey` changes.
 * Pausing keeps the remaining time; `onExpire` fires once when it reaches zero.
 */
export function useCountdown(total: number, running: boolean, resetKey: string, onExpire: () => void) {
  const [remaining, setRemaining] = useState(total);
  const remainingRef = useRef(total);
  const expireRef = useRef(onExpire);
  expireRef.current = onExpire;

  useEffect(() => {
    remainingRef.current = total;
    setRemaining(total);
  }, [resetKey, total]);

  useEffect(() => {
    if (!running || total <= 0 || remainingRef.current <= 0) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      remainingRef.current = Math.max(0, remainingRef.current - (now - last) / 1000);
      last = now;
      setRemaining(remainingRef.current);
      if (remainingRef.current <= 0) {
        expireRef.current();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, total, resetKey]);

  return remaining;
}
