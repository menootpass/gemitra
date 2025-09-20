// API Service untuk semua endpoint

// URL utama dari environment variables (server/client aware)
function getMainScriptUrl(): string {
  const url = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL;
  const finalUrl = url || 'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec';
  
  // Debug logging untuk memastikan URL yang benar
  if (process.env.NODE_ENV === 'development') {
    console.log('🔗 [Original API] Environment URL:', url);
    console.log('🔗 [Original API] Final URL:', finalUrl);
  }
  
  // Return the URL from environment or fallback
  return finalUrl;
}

// Fungsi helper untuk menambahkan parameter endpoint ke URL utama
function getUrlWithEndpoint(endpoint: string) {
  // For events, use internal API route to avoid CORS issues
  if (endpoint === 'events') {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${baseUrl}/api/events`;
  }
  
  // For other endpoints, use direct Google Apps Script URL
  const base = getMainScriptUrl();
  return `${base}?endpoint=${endpoint}`;
}

class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit

  clearCache(): void {
    this.cache.clear();
  }

  async purgeCache(): Promise<void> {
    this.cache.clear();
    // Di masa depan, ini bisa memanggil endpoint server untuk membersihkan cache server
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  private async fetchWithCache(url: string, enableCache = true): Promise<any> {
    if (enableCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (enableCache) {
      this.cache.set(url, { data, timestamp: Date.now() });
    }
    return data;
  }

  // Destinations API
  async fetchDestinations(enableCache = true): Promise<any[]> {
    const url = getUrlWithEndpoint('destinations');
    const data = await this.fetchWithCache(url, enableCache);
    return data.data || [];
  }

  async fetchDestinationById(id: number): Promise<any> {
    const url = `${getUrlWithEndpoint('destinations')}&id=${id}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || null;
  }

  async fetchDestinationsWithLimit(limit: number): Promise<any[]> {
    const url = `${getUrlWithEndpoint('destinations')}&limit=${limit}`;
    const data = await this.fetchWithCache(url, false); // SWR handles caching
    return data.data || [];
  }

  async fetchEventsByCategory(category: string): Promise<any[]> {
    const url = `${getUrlWithEndpoint('events')}&category=${encodeURIComponent(category)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async fetchDestinationsByCategory(category: string): Promise<any[]> {
    const url = `${getUrlWithEndpoint('destinations')}&category=${encodeURIComponent(category)}`;
    const data = await this.fetchWithCache(url, false); // SWR handles caching
    return data.data || [];
  }

  async searchDestinations(query: string): Promise<any[]> {
    const url = `${getUrlWithEndpoint('destinations')}&search=${encodeURIComponent(query)}`;
    const data = await this.fetchWithCache(url, false); // SWR handles caching
    return data.data || [];
  }

  async fetchDestinationBySlug(slug: string): Promise<any> {
    const url = `${getUrlWithEndpoint('destinations')}&slug=${encodeURIComponent(slug)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || null;
  }

  // Transactions, Comments, Feedback API (menggunakan POST ke API Route Next.js)
  async createTransaction(transactionData: any): Promise<any> {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
  
  async createComment(commentData: any): Promise<any> {
    const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
    });
    const text = await response.text();
    if (!response.ok) {
      try {
        const json = JSON.parse(text);
        throw new Error(json.message || `HTTP error! status: ${response.status}`);
      } catch {
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }
    }
    try {
      return JSON.parse(text);
    } catch {
      return { success: true };
    }
  }
  
  async submitFeedback(feedbackData: any): Promise<any> {
     const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
}

class EventsApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit

  private async fetchWithCache(url: string, enableCache = true): Promise<any> {
    if (enableCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.data;
      }
    }
    
    // Enhanced fetch dengan retry logic
    let lastError: Error;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`🚀 [EventsAPI] Attempt ${attempt + 1}: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (enableCache) {
          this.cache.set(url, { data, timestamp: Date.now() });
        }
        
        console.log(`✅ [EventsAPI] Success: ${url}`);
        return data;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ [EventsAPI] Attempt ${attempt + 1} failed:`, error);
        
        if (attempt < 2) {
          const delay = 1000 * Math.pow(2, attempt);
          console.log(`⏳ [EventsAPI] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  async fetchEvents(): Promise<any[]> {
    const url = getUrlWithEndpoint('events');
    const data = await this.fetchWithCache(url, true);
    return data.data || [];
  }

  async fetchEventBySlug(slug: string): Promise<any> {
    const url = `${getUrlWithEndpoint('events')}&slug=${encodeURIComponent(slug)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || null;
  }

  async fetchEventsByCategory(category: string): Promise<any[]> {
    const url = `${getUrlWithEndpoint('events')}&category=${encodeURIComponent(category)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async incrementEventReader(eventId: string): Promise<void> {
    await fetch('/api/events/increment-reader', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: eventId })
    }).catch(() => {});
  }
}

export const apiService = new ApiService();
export const eventsApiService = new EventsApiService();
