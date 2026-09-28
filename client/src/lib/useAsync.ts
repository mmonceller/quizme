import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react';
import { errorMessage } from '@/api/client';

/** Loads data on mount / when deps change, exposing loading + error state and a reload function. */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const callId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fn, deps);

  const reload = useCallback(async () => {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await load();
      if (id === callId.current) setData(result);
    } catch (err) {
      if (id === callId.current) setError(errorMessage(err));
    } finally {
      if (id === callId.current) setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, setData, error, loading, reload };
}
