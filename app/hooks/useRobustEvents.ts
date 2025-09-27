'use client';

import { useState, useEffect, useCallback } from 'react';
import { Event } from '../types';
import { robustEventsApiService, connectionMonitor, ApiError, NetworkError } from '../services/robustApi';

interface UseEventsOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  enableRetry?: boolean;
}

export function useRobustEvents(options: UseEventsOptions = {}) {
  const {
    enablePolling = false,
    pollingInterval = 60000, // 1 menit untuk mengurangi beban server
    enableRetry = true
  } = options;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(connectionMonitor.getStatus());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [retryCount, setRetryCount] = useState(0);

  // Monitor connection status
  useEffect(() => {
    const unsubscribe = connectionMonitor.onStatusChange((online) => {
      setIsOnline(online);
      
      // Auto-retry when connection is restored
      if (online && error && enableRetry) {
        console.log('Connection restored, retrying fetch...');
        fetchEvents();
      }
    });

    return unsubscribe;
  }, [error, enableRetry]);

  const fetchEvents = useCallback(async (showLoading = true) => {
    // Skip if offline
    if (!isOnline) {
      setError('No internet connection. Please check your network.');
      setLoading(false);
      return;
    }

    // Prevent too frequent requests
    const now = Date.now();
    if (now - lastFetchTime < 2000) { // Minimum 2 seconds between requests
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      
      const data = await robustEventsApiService.fetchEvents();
      setEvents(data);
      setLastFetchTime(now);
      setRetryCount(0); // Reset retry count on success
      
    } catch (err) {
      console.error('Error fetching events:', err);
      
      let errorMessage = 'Failed to load events';
      
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
  }, [isOnline, lastFetchTime]);

  // Auto-retry with exponential backoff
  useEffect(() => {
    if (error && enableRetry && retryCount < 3 && isOnline) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10 seconds
      console.log(`Auto-retrying in ${delay}ms (attempt ${retryCount + 1}/3)...`);
      
      const timeoutId = setTimeout(() => {
        fetchEvents(false); // Don't show loading for auto-retries
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [error, enableRetry, retryCount, isOnline, fetchEvents]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, []);

  // Polling
  useEffect(() => {
    if (!enablePolling || !isOnline) return;

    const intervalId = setInterval(() => {
      if (!loading && !error) {
        fetchEvents(false); // Background refresh, no loading indicator
      }
    }, pollingInterval);

    return () => clearInterval(intervalId);
  }, [enablePolling, pollingInterval, loading, error, isOnline, fetchEvents]);

  const refresh = useCallback(() => {
    setRetryCount(0);
    fetchEvents(true);
  }, [fetchEvents]);

  return { 
    events, 
    loading, 
    error, 
    refresh,
    isOnline,
    retryCount
  };
}

export function useRobustEventBySlug(slug: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(connectionMonitor.getStatus());

  useEffect(() => {
    const unsubscribe = connectionMonitor.onStatusChange(setIsOnline);
    return unsubscribe;
  }, []);

  const fetchEvent = useCallback(async () => {
    if (!slug || !isOnline) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await robustEventsApiService.fetchEventBySlug(slug);
      setEvent(data);
      
    } catch (err) {
      console.error('Error fetching event:', err);
      
      let errorMessage = 'Failed to load event';
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
    fetchEvent();
  }, [fetchEvent]);

  const refresh = useCallback(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refresh, isOnline };
}

