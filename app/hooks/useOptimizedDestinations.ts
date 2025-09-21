'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Destination {
  id: string;
  slug: string;
  nama: string;
  harga: number;
  image: string;
  posisi: string;
  [key: string]: any;
}

interface UseOptimizedDestinationsOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  enableRetry?: boolean;
  maxRetries?: number;
  cacheTime?: number;
}

interface UseOptimizedDestinationsReturn {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  isOnline: boolean;
  retryCount: number;
  lastFetch: Date | null;
  cacheStatus: 'HIT' | 'MISS' | 'STALE';
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function useOptimizedDestinations(options: UseOptimizedDestinationsOptions = {}): UseOptimizedDestinationsReturn {
  const {
    enablePolling = false,
    pollingInterval = 30000,
    enableRetry = true,
    maxRetries = 3,
    cacheTime = 300000, // 5 minutes
  } = options;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'HIT' | 'MISS' | 'STALE'>('MISS');

  const router = useRouter();

  // Check cache first
  const getCachedData = useCallback((key: string) => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      setCacheStatus('HIT');
      return cached.data;
    } else if (cached) {
      setCacheStatus('STALE');
      return cached.data; // Return stale data while fetching fresh
    }
    setCacheStatus('MISS');
    return null;
  }, []);

  // Set cache
  const setCachedData = useCallback((key: string, data: any, ttl: number = cacheTime) => {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }, [cacheTime]);

  // Optimized fetch function with caching and retry logic
  const fetchDestinations = useCallback(async (isRetry = false) => {
    const cacheKey = 'destinations';
    
    // Try cache first
    if (!isRetry) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData && cacheStatus === 'HIT') {
        setDestinations(cachedData);
        setLoading(false);
        return;
      } else if (cachedData && cacheStatus === 'STALE') {
        setDestinations(cachedData); // Show stale data immediately
      }
    }

    try {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/destinations', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'max-age=300',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process and validate data
      const processedDestinations = Array.isArray(data) ? data : (data?.data || []);
      
      // Validate and filter destinations with valid position data
      const validDestinations = processedDestinations.filter((dest: any) => {
        if (!dest.posisi) return false;
        
        try {
          let posisiData;
          if (typeof dest.posisi === 'string') {
            posisiData = JSON.parse(dest.posisi);
          } else {
            posisiData = dest.posisi;
          }
          
          if (!Array.isArray(posisiData) || posisiData.length !== 2) return false;
          
          const [lat, lng] = posisiData;
          return (
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            lat >= -11 && lat <= 6 && // Indonesia latitude range
            lng >= 95 && lng <= 141   // Indonesia longitude range
          );
        } catch (e) {
          return false;
        }
      });

      setDestinations(validDestinations);
      setCachedData(cacheKey, validDestinations);
      setLastFetch(new Date());
      setRetryCount(0);
      setCacheStatus('HIT');

    } catch (err) {
      console.error('Error fetching destinations:', err);
      
      if (enableRetry && retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchDestinations(true);
        }, Math.pow(2, retryCount) * 1000); // Exponential backoff
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch destinations';
        setError(errorMessage);
        setRetryCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [enableRetry, maxRetries, retryCount, getCachedData, setCachedData, cacheStatus]);

  // Refresh function
  const refresh = useCallback(() => {
    cache.delete('destinations'); // Clear cache
    fetchDestinations();
  }, [fetchDestinations]);

  // Connection monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (destinations.length === 0) {
        fetchDestinations();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [destinations.length, fetchDestinations]);

  // Initial fetch
  useEffect(() => {
    fetchDestinations();
  }, []);

  // Polling effect
  useEffect(() => {
    if (!enablePolling || !isOnline) return;

    const interval = setInterval(() => {
      fetchDestinations();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, isOnline, fetchDestinations]);

  // Memoized return value to prevent unnecessary re-renders
  return useMemo(() => ({
    destinations,
    loading,
    error,
    refresh,
    isOnline,
    retryCount,
    lastFetch,
    cacheStatus,
  }), [destinations, loading, error, refresh, isOnline, retryCount, lastFetch, cacheStatus]);
}
