// Performance monitoring utilities untuk debugging masalah fetch

interface PerformanceMetric {
  url: string;
  method: string;
  duration: number;
  status: number | 'timeout' | 'network_error';
  timestamp: number;
  retryCount?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100; // Keep last 100 requests

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordRequest(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow requests
    if (typeof metric.status === 'number' && metric.duration > 5000) {
      console.warn(`Slow request detected: ${metric.url} took ${metric.duration}ms`);
    }

    // Log failed requests
    if (typeof metric.status !== 'number' || metric.status >= 400) {
      console.error(`Failed request: ${metric.url} - Status: ${metric.status}, Duration: ${metric.duration}ms`);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getStats(): {
    totalRequests: number;
    averageDuration: number;
    successRate: number;
    slowRequests: number;
    failedRequests: number;
    timeoutRequests: number;
  } {
    const total = this.metrics.length;
    if (total === 0) {
      return {
        totalRequests: 0,
        averageDuration: 0,
        successRate: 100,
        slowRequests: 0,
        failedRequests: 0,
        timeoutRequests: 0
      };
    }

    const successful = this.metrics.filter(m => typeof m.status === 'number' && m.status >= 200 && m.status < 300);
    const failed = this.metrics.filter(m => typeof m.status !== 'number' || m.status >= 400);
    const timeouts = this.metrics.filter(m => m.status === 'timeout');
    const slow = this.metrics.filter(m => m.duration > 3000);
    
    const avgDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0) / total;

    return {
      totalRequests: total,
      averageDuration: Math.round(avgDuration),
      successRate: Math.round((successful.length / total) * 100),
      slowRequests: slow.length,
      failedRequests: failed.length,
      timeoutRequests: timeouts.length
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  // Debug helper untuk development
  logStats(): void {
    // Performance stats logging removed for production optimization
  }
}

// Enhanced fetch wrapper dengan performance monitoring
export async function monitoredFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const startTime = Date.now();
  const monitor = PerformanceMonitor.getInstance();
  
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    
    // Record successful request
    monitor.recordRequest({
      url,
      method: options.method || 'GET',
      duration,
      status: response.status,
      timestamp: Date.now()
    });
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    let status: number | 'timeout' | 'network_error' = 'network_error';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        status = 'timeout';
      }
    }
    
    // Record failed request
    monitor.recordRequest({
      url,
      method: options.method || 'GET',
      duration,
      status,
      timestamp: Date.now()
    });
    
    throw error;
  }
}

// Rate limiter untuk mencegah spam requests
class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly windowMs = 60000; // 1 minute window
  private readonly maxRequests = 30; // Max 30 requests per minute per endpoint

  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(timestamp => now - timestamp < this.windowMs);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    return oldestRequest + this.windowMs;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export const rateLimiter = new RateLimiter();

// Development helpers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Make performance monitor available in browser console
  (window as any).performanceMonitor = performanceMonitor;
  
  // Auto-log stats every 2 minutes in development
  setInterval(() => {
    try {
      const stats = performanceMonitor.getStats();
      if (stats.totalRequests > 0) {
        performanceMonitor.logStats();
      }
    } catch (error) {
      console.warn('Failed to log performance stats:', error);
    }
  }, 120000);
}

