import { useEffect, useState } from 'react';

// Runs loader() whenever deps change and tracks loading / error state.
export default function useFetch(loader, deps) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false; // avoids showing an old response after a newer request
    setLoading(true);
    loader()
      .then((result) => {
        if (!ignore) {
          setData(result);
          setError('');
        }
      })
      .catch((err) => !ignore && setError(err.message))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, setData, loading, error };
}
