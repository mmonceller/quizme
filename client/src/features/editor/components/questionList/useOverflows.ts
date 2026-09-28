import { useLayoutEffect, useRef, useState } from 'react';

/** Tracks whether an element's content is wider than the element itself. */
export function useOverflows<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [ref, overflows] as const;
}
