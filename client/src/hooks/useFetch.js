import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/api';

// Small shared data-fetching hook: loading/error/data + a refetch() escape
// hatch, used across course/lesson/quiz/admin pages instead of duplicating
// the same try/catch/setState boilerplate everywhere.
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, setData, loading, error, refetch: run };
}
