import { useState, useCallback } from 'react';

export function useApi(fetcher, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher(...args);
        setData(result);
        return result;
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Something went wrong';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetcher]
  );

  const reset = useCallback(() => {
    setData(options.initialData ?? null);
    setError(null);
  }, [options.initialData]);

  return { data, loading, error, execute, reset };
}
