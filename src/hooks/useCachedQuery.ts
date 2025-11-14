import { useEffect, useState, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

interface UseCachedQueryOptions<T> {
  cacheKey: string;
  queryFn: () => Promise<T>;
  cacheDuration?: number; // in milliseconds
  enabled?: boolean;
}

/**
 * Custom hook for caching query results in memory
 * Reduces unnecessary API calls and improves performance
 */
export function useCachedQuery<T>({
  cacheKey,
  queryFn,
  cacheDuration = 5 * 60 * 1000, // Default 5 minutes
  enabled = true,
}: UseCachedQueryOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Check cache first
        const cached = cache.get(cacheKey);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < cacheDuration) {
          if (isMounted.current) {
            setData(cached.data);
            setLoading(false);
          }
          return;
        }

        // Fetch fresh data
        setLoading(true);
        const result = await queryFn();
        
        if (isMounted.current) {
          // Update cache
          cache.set(cacheKey, {
            data: result,
            timestamp: now,
          });
          
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [cacheKey, cacheDuration, enabled]);

  const invalidate = () => {
    cache.delete(cacheKey);
  };

  const refetch = async () => {
    invalidate();
    setLoading(true);
    
    try {
      const result = await queryFn();
      if (isMounted.current) {
        cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
}

// Utility function to clear all cache
export function clearAllCache() {
  cache.clear();
}

// Utility function to clear cache by prefix
export function clearCacheByPrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}
