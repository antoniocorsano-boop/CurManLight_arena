import { useEffect, useRef, useCallback } from 'react';

export function useSimulations() {
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const addInterval = useCallback((fn: () => void, delay: number) => {
    const id = setInterval(fn, delay);
    intervalsRef.current.push(id);
    return id;
  }, []);

  const clearAll = useCallback(() => {
    intervalsRef.current.forEach(id => clearInterval(id));
    intervalsRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(id => clearInterval(id));
      intervalsRef.current = [];
    };
  }, []);

  return { addInterval, clearAll, intervals: intervalsRef.current };
}
