// Enhanced API Service dengan retry logic, timeout, dan request queuing
// untuk mengatasi masalah "failed to fetch" saat banyak pengguna

import { monitoredFetch, rateLimiter } from '../utils/performanceMonitor';

// URL utama dari environment variables dengan fallback URLs
function getMainScriptUrl(): string {
  const url = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL;
  
  // Primary URL (fix-ids.gs deployment)
  const primaryUrl = url || 'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec';
  
  // Debug logging untuk memastikan URL yang benar
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 [Robust API] Using Google Apps Script URL:', primaryUrl);
    console.log('🔗 [Robust API] Environment variable NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL:', url);
  }
  
  return primaryUrl;
}

// Fallback URLs jika primary URL gagal
function getFallbackUrls(): string[] {
  return [
    // Tidak menggunakan URL fallback untuk sementara karena URL tersebut bermasalah
    // 'https://script.google.com/macros/s/AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw/exec',
  ];
}

function getUrlWithEndpoint(endpoint: string) {
  // Use internal API routes for all endpoints to avoid CORS issues in development
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001';
  
  let finalUrl: string;
  
  // Route all endpoints through internal API
  switch (endpoint) {
    case 'events':
      finalUrl = `${baseUrl}/api/events`;
      break;
    case 'destinations':
      finalUrl = `${baseUrl}/api/destinations`;
      break;
    case 'transactions':
      finalUrl = `${baseUrl}/api/transactions`;
      break;
    case 'feedback':
      finalUrl = `${baseUrl}/api/feedback`;
      break;
    case 'comments':
      finalUrl = `${baseUrl}/api/comments`;
      break;
    default:
      // Fallback to direct Google Apps Script URL for unknown endpoints
      const base = getMainScriptUrl();
      finalUrl = `${base}?endpoint=${endpoint}`;
      break;
  }
  
  // Debug logging untuk memastikan URL yang benar
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 [Robust API] Using internal API route for "${endpoint}":`, finalUrl);
  }
  
  return finalUrl;
}

// Request queue untuk mencegah spam requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly maxConcurrent = 3; // Maksimal 3 request bersamaan
  private currentRequests = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.currentRequests >= this.maxConcurrent) return;
    
    const request = this.queue.shift();
    if (!request) return;

    this.processing = true;
    this.currentRequests++;

    try {
      await request();
    } finally {
      this.currentRequests--;
      this.processing = false;
      
      // Process next request if available
      if (this.queue.length > 0) {
        setTimeout(() => this.process(), 100); // Small delay between requests
      }
    }
  }
}

// Utility functions untuk retry dan timeout
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Jangan retry untuk error tertentu
      if (error instanceof Error) {
        // 4xx errors (client errors) tidak perlu di-retry
        if (error.message.includes('400') || error.message.includes('401') || 
            error.message.includes('403') || error.message.includes('404')) {
          throw error;
        }
      }
      
      if (attempt < maxRetries) {
        // Exponential backoff dengan jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`Request failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`, error);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  etag?: string;
}

class RobustApiService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 menit untuk high traffic
  private readonly STALE_WHILE_REVALIDATE_DURATION = 30 * 60 * 1000; // 30 menit stale
  private readonly REQUEST_TIMEOUT = 15000; // 15 detik timeout
  private requestQueue = new RequestQueue();

  clearCache(): void {
    this.cache.clear();
  }

  async purgeCache(): Promise<void> {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[]; memoryUsage: string } {
    const size = this.cache.size;
    const keys = Array.from(this.cache.keys());
    const memoryUsage = `${Math.round(JSON.stringify(Array.from(this.cache.values())).length / 1024)}KB`;
    
    return { size, keys, memoryUsage };
  }

  private async fetchWithAdvancedCache(url: string, enableCache = true): Promise<any> {
    const cacheKey = url;
    
    if (enableCache) {
      const cached = this.cache.get(cacheKey);
      const now = Date.now();
      
      if (cached) {
        // Fresh cache - return immediately
        if (now - cached.timestamp < this.CACHE_DURATION) {
          return cached.data;
        }
        
        // Stale but revalidate in background
        if (now - cached.timestamp < this.STALE_WHILE_REVALIDATE_DURATION) {
          // Return stale data immediately
          const staleData = cached.data;
          
          // Revalidate in background (fire and forget)
          this.backgroundRevalidate(url, cacheKey).catch(() => {
            // Silent fail untuk background revalidation
          });
          
          return staleData;
        }
      }
    }

    // Fresh fetch dengan retry dan timeout
    return this.requestQueue.add(async () => {
      const data = await this.performFetch(url);
      
      if (enableCache) {
        this.cache.set(cacheKey, { 
          data, 
          timestamp: Date.now() 
        });
        
        // Cleanup old cache entries
        this.cleanupCache();
      }
      
      return data;
    });
  }

  private async backgroundRevalidate(url: string, cacheKey: string): Promise<void> {
    try {
      const data = await this.performFetch(url);
      this.cache.set(cacheKey, { 
        data, 
        timestamp: Date.now() 
      });
    } catch (error) {
      console.warn('Background revalidation failed:', error);
    }
  }

  private async performFetch(url: string): Promise<any> {
    // Debug logging untuk tracking URL yang dipanggil
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 [Robust API] Making request to:', url);
    }
    
    // Check rate limit
    const rateLimitKey = new URL(url).pathname + new URL(url).search;
    if (!rateLimiter.isAllowed(rateLimitKey)) {
      const resetTime = rateLimiter.getResetTime(rateLimitKey);
      const waitTime = Math.max(0, resetTime - Date.now());
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Try primary URL first, then fallbacks
    const urlsToTry = [url];
    
    // If primary URL fails, try fallback URLs
    const fallbackUrls = getFallbackUrls();
    const endpoint = new URL(url).searchParams.get('endpoint');
    if (endpoint) {
      fallbackUrls.forEach(fallbackBase => {
        urlsToTry.push(`${fallbackBase}?endpoint=${endpoint}`);
      });
    }

    let lastError: Error;
    
    for (let i = 0; i < urlsToTry.length; i++) {
      const currentUrl = urlsToTry[i];
      
      try {
        return await withRetry(async () => {
          const response = await withTimeout(
            monitoredFetch(currentUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'User-Agent': 'Gemitra-App/1.0',
              },
              // Add mode for development
              ...(process.env.NODE_ENV === 'development' && currentUrl.includes('localhost') ? {
                mode: 'cors' as RequestMode
              } : {})
            }),
            this.REQUEST_TIMEOUT
          );
          
          if (!response.ok) {
            console.error(`❌ [Robust API] Request failed: ${currentUrl} - Status: ${response.status}`);
            if (response.status === 429) {
              throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            }
            if (response.status >= 500) {
              throw new Error(`Server error (${response.status}). Please try again later.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Request successful:', currentUrl);
            if (i > 0) {
              console.log(`🔄 Used fallback URL #${i}`);
            }
          }
          
          return data;
        }, i === 0 ? 3 : 1, 1000); // Fewer retries for fallback URLs
        
      } catch (error) {
        lastError = error as Error;
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`❌ URL ${i + 1}/${urlsToTry.length} failed:`, currentUrl, error);
        }
        
        // Continue to next URL if available
        if (i < urlsToTry.length - 1) {
          continue;
        }
      }
    }
    
    // All URLs failed
    throw lastError!;
  }

  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = this.STALE_WHILE_REVALIDATE_DURATION;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
    
    // Limit cache size to prevent memory issues
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 20 entries
      for (let i = 0; i < 20; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  // Enhanced API methods dengan error handling yang lebih baik
  async fetchDestinations(enableCache = true): Promise<any[]> {
    try {
      const url = getUrlWithEndpoint('destinations');
      const data = await this.fetchWithAdvancedCache(url, enableCache);
      return data.data || [];
    } catch (error) {
      console.error('❌ [Robust API] Failed to fetch destinations:', error);
      
      // Return cached data if available (even if stale)
      if (enableCache) {
        const cached = this.cache.get(getUrlWithEndpoint('destinations'));
        if (cached) {
          console.warn('⚠️ [Robust API] Returning stale cached data due to fetch failure');
          return cached.data.data || [];
        }
      }
      
      // In development, try direct Google Apps Script URL as fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [Robust API] Trying direct Google Apps Script URL as fallback...');
        try {
          const directUrl = `${getMainScriptUrl()}?endpoint=destinations`;
          const fallbackData = await this.performFetch(directUrl);
          console.log('✅ [Robust API] Fallback successful');
          return fallbackData.data || [];
        } catch (fallbackError) {
          console.error('❌ [Robust API] Fallback also failed:', fallbackError);
          
          // Last resort: return test data for development
          console.log('🧪 [Robust API] Using test data as final fallback...');
          try {
            const { testDestinations } = await import('../data/testDestinations');
            console.log('✅ [Robust API] Test data loaded successfully');
            return testDestinations;
          } catch (testError) {
            console.error('❌ [Robust API] Failed to load test data:', testError);
          }
        }
      }
      
      throw error;
    }
  }

  async fetchDestinationById(id: number): Promise<any> {
    try {
      const url = `${getUrlWithEndpoint('destinations')}?id=${id}`;
      const data = await this.fetchWithAdvancedCache(url, true);
      return data.data || null;
    } catch (error) {
      console.error(`Failed to fetch destination ${id}:`, error);
      throw error;
    }
  }

  async fetchDestinationBySlug(slug: string): Promise<any> {
    try {
      const url = `${getUrlWithEndpoint('destinations')}?slug=${encodeURIComponent(slug)}`;
      const data = await this.fetchWithAdvancedCache(url, true);
      return data.data || null;
    } catch (error) {
      console.error(`Failed to fetch destination by slug ${slug}:`, error);
      throw error;
    }
  }

  async fetchDestinationsWithLimit(limit: number): Promise<any[]> {
    try {
      const url = `${getUrlWithEndpoint('destinations')}?limit=${limit}`;
      const data = await this.fetchWithAdvancedCache(url, true);
      return data.data || [];
    } catch (error) {
      console.error(`Failed to fetch destinations with limit ${limit}:`, error);
      throw error;
    }
  }

  async fetchDestinationsByCategory(category: string): Promise<any[]> {
    try {
      const url = `${getUrlWithEndpoint('destinations')}?category=${encodeURIComponent(category)}`;
      const data = await this.fetchWithAdvancedCache(url, true);
      return data.data || [];
    } catch (error) {
      console.error(`Failed to fetch destinations by category ${category}:`, error);
      throw error;
    }
  }

  async searchDestinations(query: string): Promise<any[]> {
    try {
      const url = `${getUrlWithEndpoint('destinations')}?search=${encodeURIComponent(query)}`;
      const data = await this.fetchWithAdvancedCache(url, false); // Search results shouldn't be cached long
      return data.data || [];
    } catch (error) {
      console.error(`Failed to search destinations with query ${query}:`, error);
      throw error;
    }
  }

  // Enhanced POST methods dengan retry
  async createTransaction(transactionData: any): Promise<any> {
    return withRetry(async () => {
      const response = await withTimeout(
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData),
        }),
        this.REQUEST_TIMEOUT
      );
      
      if (!response.ok) {
        throw new Error(`Transaction failed! status: ${response.status}`);
      }
      
      return response.json();
    }, 2, 2000); // 2 retries for POST operations
  }
  
  async createComment(commentData: any): Promise<any> {
    return withRetry(async () => {
      const response = await withTimeout(
        fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentData),
        }),
        this.REQUEST_TIMEOUT
      );
      
      const text = await response.text();
      if (!response.ok) {
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || `Comment failed! status: ${response.status}`);
        } catch {
          throw new Error(text || `Comment failed! status: ${response.status}`);
        }
      }
      
      try {
        return JSON.parse(text);
      } catch {
        return { success: true };
      }
    }, 2, 1500);
  }
  
  async submitFeedback(feedbackData: any): Promise<any> {
    return withRetry(async () => {
      const response = await withTimeout(
        fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData),
        }),
        this.REQUEST_TIMEOUT
      );
      
      if (!response.ok) {
        throw new Error(`Feedback submission failed! status: ${response.status}`);
      }
      
      return response.json();
    }, 2, 1500);
  }
}

class RobustEventsApiService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 menit
  private readonly STALE_WHILE_REVALIDATE_DURATION = 30 * 60 * 1000; // 30 menit
  private readonly REQUEST_TIMEOUT = 15000; // 15 detik
  private requestQueue = new RequestQueue();

  private async fetchWithAdvancedCache(url: string, enableCache = true): Promise<any> {
    const cacheKey = url;
    
    if (enableCache) {
      const cached = this.cache.get(cacheKey);
      const now = Date.now();
      
      if (cached) {
        // Fresh cache
        if (now - cached.timestamp < this.CACHE_DURATION) {
          return cached.data;
        }
        
        // Stale but revalidate
        if (now - cached.timestamp < this.STALE_WHILE_REVALIDATE_DURATION) {
          const staleData = cached.data;
          
          // Background revalidation
          this.backgroundRevalidate(url, cacheKey).catch(() => {});
          
          return staleData;
        }
      }
    }

    return this.requestQueue.add(async () => {
      const data = await this.performFetch(url);
      
      if (enableCache) {
        this.cache.set(cacheKey, { 
          data, 
          timestamp: Date.now() 
        });
        this.cleanupCache();
      }
      
      return data;
    });
  }

  private async backgroundRevalidate(url: string, cacheKey: string): Promise<void> {
    try {
      const data = await this.performFetch(url);
      this.cache.set(cacheKey, { 
        data, 
        timestamp: Date.now() 
      });
    } catch (error) {
      console.warn('Background revalidation failed:', error);
    }
  }

  private async performFetch(url: string): Promise<any> {
    // Debug logging untuk tracking URL yang dipanggil
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 [Events API] Making request to:', url);
    }
    
    // Check rate limit
    const rateLimitKey = new URL(url).pathname + new URL(url).search;
    if (!rateLimiter.isAllowed(rateLimitKey)) {
      const resetTime = rateLimiter.getResetTime(rateLimitKey);
      const waitTime = Math.max(0, resetTime - Date.now());
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    // Try primary URL first, then fallbacks
    const urlsToTry = [url];
    
    const fallbackUrls = getFallbackUrls();
    const endpoint = new URL(url).searchParams.get('endpoint');
    if (endpoint) {
      fallbackUrls.forEach(fallbackBase => {
        urlsToTry.push(`${fallbackBase}?endpoint=${endpoint}`);
      });
    }

    let lastError: Error;
    
    for (let i = 0; i < urlsToTry.length; i++) {
      const currentUrl = urlsToTry[i];
      
      try {
        return await withRetry(async () => {
          const response = await withTimeout(
            monitoredFetch(currentUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
              },
            }),
            this.REQUEST_TIMEOUT
          );
          
          if (!response.ok) {
            console.error(`❌ [Events API] Request failed: ${currentUrl} - Status: ${response.status}`);
            if (response.status === 429) {
              throw new Error('Rate limit exceeded. Please wait a moment.');
            }
            if (response.status >= 500) {
              throw new Error(`Server error (${response.status}). Please try again.`);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ [Events API] Request successful:', currentUrl);
            if (i > 0) {
              console.log(`🔄 [Events API] Used fallback URL #${i}`);
            }
          }
          
          return data;
        }, i === 0 ? 3 : 1, 1000);
        
      } catch (error) {
        lastError = error as Error;
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`❌ [Events API] URL ${i + 1}/${urlsToTry.length} failed:`, currentUrl, error);
        }
        
        if (i < urlsToTry.length - 1) {
          continue;
        }
      }
    }
    
    throw lastError!;
  }

  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = this.STALE_WHILE_REVALIDATE_DURATION;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
    
    if (this.cache.size > 50) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < 10; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  async fetchEvents(): Promise<any[]> {
    try {
      const url = getUrlWithEndpoint('events');
      const data = await this.fetchWithAdvancedCache(url, true);
      return data.data || [];
    } catch (error) {
      console.error('Failed to fetch events:', error);
      
      // Return cached data if available
      const cached = this.cache.get(getUrlWithEndpoint('events'));
      if (cached) {
        console.warn('Returning stale cached events due to fetch failure');
        return cached.data.data || [];
      }
      
      throw error;
    }
  }

  async fetchEventBySlug(slug: string): Promise<any> {
    try {
      const url = `${getUrlWithEndpoint('events')}?slug=${encodeURIComponent(slug)}`;
      const data = await this.fetchWithAdvancedCache(url, true);
      
      console.log('🔍 [Robust API] fetchEventBySlug response:', {
        slug,
        dataType: typeof data,
        isArray: Array.isArray(data),
        hasDataKey: 'data' in data,
        dataKeys: typeof data === 'object' ? Object.keys(data) : 'not object'
      });
      
      // Handle different response structures
      if (Array.isArray(data)) {
        // If data is directly an array, return first item
        return data.length > 0 ? data[0] : null;
      } else if (data && typeof data === 'object') {
        // If data has a data property
        if (data.data) {
          if (Array.isArray(data.data)) {
            return data.data.length > 0 ? data.data[0] : null;
          } else {
            return data.data;
          }
        }
        // If data is a single event object
        return data;
      }
      
      return null;
    } catch (error) {
      console.error(`❌ [Robust API] Failed to fetch event by slug ${slug}:`, error);
      
      // In development, try test data as fallback
      if (process.env.NODE_ENV === 'development') {
        console.log('🧪 [Robust API] Trying test events data as fallback...');
        try {
          const { testEvents } = await import('../data/testEvents');
          const testEvent = testEvents.find(event => event.slug === slug);
          if (testEvent) {
            console.log('✅ [Robust API] Test event found:', testEvent.title);
            return testEvent;
          } else {
            console.log('❌ [Robust API] Test event not found for slug:', slug);
          }
        } catch (testError) {
          console.error('❌ [Robust API] Failed to load test events:', testError);
        }
      }
      
      throw error;
    }
  }

  async fetchEventsByCategory(category: string): Promise<any[]> {
    try {
      const url = `${getUrlWithEndpoint('events')}?category=${encodeURIComponent(category)}`;
      const data = await this.fetchWithAdvancedCache(url, true);
      return data.data || [];
    } catch (error) {
      console.error(`Failed to fetch events by category ${category}:`, error);
      throw error;
    }
  }

  async incrementEventReader(eventId: string): Promise<void> {
    try {
      await withRetry(async () => {
        const response = await withTimeout(
          fetch('/api/events/increment-reader', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: eventId })
          }),
          5000 // Shorter timeout for increment operations
        );
        
        if (!response.ok) {
          throw new Error(`Failed to increment reader: ${response.status}`);
        }
      }, 1, 1000); // Only 1 retry for increment operations
    } catch (error) {
      // Silent fail untuk increment - tidak critical
      console.warn('Failed to increment event reader:', error);
    }
  }
}

// Connection health monitoring
class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Array<(online: boolean) => void> = [];

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      // Initial check
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        console.log('🌐 [Connection Monitor] Connection restored');
        this.isOnline = true;
        this.notifyListeners(true);
      });
      
      window.addEventListener('offline', () => {
        console.log('📵 [Connection Monitor] Connection lost');
        this.isOnline = false;
        this.notifyListeners(false);
      });
      
      // In development, assume we're always online for localhost
      if (process.env.NODE_ENV === 'development') {
        this.isOnline = true;
      }
    }
  }

  getStatus(): boolean {
    return this.isOnline;
  }

  onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }
}

// Enhanced error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network connection failed') {
    super(message, undefined, true);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timeout') {
    super(message, undefined, true);
    this.name = 'TimeoutError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, false);
    this.name = 'RateLimitError';
  }
}

// Exports
export const robustApiService = new RobustApiService();
export const robustEventsApiService = new RobustEventsApiService();
export const connectionMonitor = ConnectionMonitor.getInstance();

// Fallback to original services for backward compatibility
export { apiService, eventsApiService } from './api';
