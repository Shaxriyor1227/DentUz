import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(apiFn, initialData = null, immediate = true) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const apiFnRef = useRef(apiFn);
  useEffect(() => {
    apiFnRef.current = apiFn;
  }, [apiFn]);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFnRef.current(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'Xatolik yuz berdi');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, setData };
}
