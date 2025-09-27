'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Destination } from '../types';
import { robustApiService, connectionMonitor, ApiError, NetworkError } from '../services/robustApi';

interface UseDestinationsOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  enableRetry?: boolean;
  limit?: number;
  category?: string;
  searchTerm?: string;
}

export function useRobustDestinations(options: UseDestinationsOptions = {}) {
  const {
    enablePolling = false,
    pollingInterval = 60000, // 1 menit untuk mengurangi beban server
    enableRetry = true,
    limit,
    category,
    searchTerm
  } = options;

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(connectionMonitor.getStatus());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = connectionMonitor.onStatusChange((online) => {
      setIsOnline(online);
      
      if (online && error && enableRetry) {
        fetchDestinations();
      }
    });

    return unsubscribe;
  }, [error, enableRetry]);

  const fetchDestinations = useCallback(async (showLoading = true) => {

    if (!isOnline) {
      console.warn('📵 [useRobustDestinations] No internet connection detected');
      setError('No internet connection. Please check your network.');
      setLoading(false);
      return;
    }

    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      
      let data: any[];
      
      // Choose appropriate fetch method based on options
      if (searchTerm) {
        data = await robustApiService.searchDestinations(searchTerm);
      } else if (category) {
        data = await robustApiService.fetchDestinationsByCategory(category);
      } else if (limit) {
        data = await robustApiService.fetchDestinationsWithLimit(limit);
      } else {
        data = await robustApiService.fetchDestinations();
      }
      
      
      // Process destinations data with enhanced position handling
      const processedData = data.map((d: any) => ({
        ...d,
        posisi: d.posisi ? (() => {
          // Handle already parsed arrays
          if (Array.isArray(d.posisi)) {
            if (d.posisi.length === 2 && 
                typeof d.posisi[0] === 'number' && typeof d.posisi[1] === 'number' &&
                !isNaN(d.posisi[0]) && !isNaN(d.posisi[1])) {
              const [lat, lng] = d.posisi;
              // Validate coordinate ranges for Indonesia
              if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) {
                return [lat, lng];
              } else {
                console.warn(`Invalid coordinates for ${d.nama}: [${lat}, ${lng}]`);
                return null;
              }
            }
            return null;
          }
          
          // Handle string format
          if (typeof d.posisi === 'string') {
            try {
              const parsed = JSON.parse(d.posisi);
              if (Array.isArray(parsed) && parsed.length === 2 && 
                  typeof parsed[0] === 'number' && typeof parsed[1] === 'number' &&
                  !isNaN(parsed[0]) && !isNaN(parsed[1])) {
                const [lat, lng] = parsed;
                // Validate coordinate ranges for Indonesia
                if (lat >= -11 && lat <= 6 && lng >= 95 && lng <= 141) {
                  return [lat, lng];
                } else {
                  console.warn(`Invalid coordinates for ${d.nama}: [${lat}, ${lng}]`);
                  return null;
                }
              }
              return null;
            } catch (e) {
              console.warn(`Failed to parse position data for ${d.nama}:`, d.posisi, e);
              return null;
            }
          }
          
          return null;
        })() : null,
      }));
      
      
      setDestinations(processedData);
      setLastFetchTime(now);
      setRetryCount(0);
      
    } catch (err) {
      console.error('Error fetching destinations:', err);
      
      let errorMessage = 'Failed to load destinations';
      
      if (err instanceof NetworkError) {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (err instanceof ApiError) {
        if (err.statusCode === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        } else if (err.statusCode && err.statusCode >= 500) {
          errorMessage = 'Server is temporarily unavailable. Please try again later.';
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please check your connection and try again.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
      
    } finally {
      setLoading(false);
    }
  }, [isOnline, lastFetchTime, searchTerm, category, limit]);

  // Auto-retry logic
  useEffect(() => {
    if (error && enableRetry && retryCount < 3 && isOnline) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      
      const timeoutId = setTimeout(() => {
        fetchDestinations(false);
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [error, enableRetry, retryCount, isOnline, fetchDestinations]);

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    setRetryCount(0);
    fetchDestinations();
  }, [searchTerm, category, limit]);

  // Polling
  useEffect(() => {
    if (!enablePolling || !isOnline) return;

    const intervalId = setInterval(() => {
      if (!loading && !error) {
        fetchDestinations(false);
      }
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [enablePolling, pollingInterval, loading, error, isOnline, fetchDestinations]);

  const refresh = useCallback(() => {
    setRetryCount(0);
    fetchDestinations(true);
  }, [fetchDestinations]);

  return { 
    destinations, 
    loading, 
    error, 
    refresh,
    isOnline,
    retryCount
  };
}

export function useRobustDestinationBySlug(slug: string) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(connectionMonitor.getStatus());

  useEffect(() => {
    const unsubscribe = connectionMonitor.onStatusChange(setIsOnline);
    return unsubscribe;
  }, []);

  const fetchDestination = useCallback(async () => {
    if (!slug || !isOnline) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await robustApiService.fetchDestinationBySlug(slug);
      setDestination(data);
      
    } catch (err) {
      console.error('Error fetching destination:', err);
      
      let errorMessage = 'Failed to load destination';
      if (err instanceof ApiError) {
        errorMessage = err.message;
      } else if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timeout. Please try again.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [slug, isOnline]);

  useEffect(() => {
    fetchDestination();
  }, [fetchDestination]);

  const refresh = useCallback(() => {
    fetchDestination();
  }, [fetchDestination]);

  return { destination, loading, error, refresh, isOnline };
}

// Hook untuk multiple destinations dengan batching
export function useRobustDestinationsBatch(ids: number[]) {
  const [destinations, setDestinations] = useState<Map<number, Destination>>(new Map());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Map<number, string>>(new Map());

  const fetchBatch = useCallback(async () => {
    if (ids.length === 0) return;

    setLoading(true);
    const newDestinations = new Map<number, Destination>();
    const newErrors = new Map<number, string>();

    // Batch requests dengan delay untuk menghindari rate limiting
    for (let i = 0; i < ids.length; i++) {
      try {
        const data = await robustApiService.fetchDestinationById(ids[i]);
        if (data) {
          newDestinations.set(ids[i], data);
        }
        
        // Add small delay between requests
        if (i < ids.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch';
        newErrors.set(ids[i], errorMessage);
      }
    }

    setDestinations(newDestinations);
    setErrors(newErrors);
    setLoading(false);
  }, [ids]);

  useEffect(() => {
    fetchBatch();
  }, [fetchBatch]);

  return {
    destinations,
    loading,
    errors,
    refresh: fetchBatch
  };
}

