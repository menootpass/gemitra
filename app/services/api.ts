// API Service untuk semua endpoint
export class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit

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
    const url = "https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec";
    const data = await this.fetchWithCache(url, enableCache);
    return data.data || [];
  }

  async fetchDestinationsWithLimit(limit: number): Promise<any[]> {
    const url = `https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec?limit=${limit}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async fetchDestinationsByCategory(category: string): Promise<any[]> {
    const url = `https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec?category=${encodeURIComponent(category)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async searchDestinations(query: string): Promise<any[]> {
    const url = `https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec?search=${encodeURIComponent(query)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async fetchDestinationById(id: number): Promise<any> {
    const url = `https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec?id=${id}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || null;
  }

  async fetchDestinationBySlug(slug: string): Promise<any> {
    const url = `https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec?slug=${encodeURIComponent(slug)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || null;
  }

  // Transactions API
  async createTransaction(transactionData: any): Promise<any> {
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Comments API
  async createComment(commentData: any): Promise<any> {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Feedback API
  async submitFeedback(feedbackData: any): Promise<any> {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  async purgeCache(): Promise<void> {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Events API Service
export class EventsApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit

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

  async fetchEvents(): Promise<any[]> {
    const baseUrl = process.env.GEMITRA_EVENTS_URL || "https://script.google.com/macros/s/AKfycbxpr2JiKv4exY0UrBrXrArLYTTi8Qxh3DrugG_anIjUReS0Y38zE3bqS9R0mb35brfUEA/exec";
    const data = await this.fetchWithCache(baseUrl, true);
    return data.data || [];
  }

  async fetchEventBySlug(slug: string): Promise<any> {
    const baseUrl = process.env.GEMITRA_EVENTS_URL || "https://script.google.com/macros/s/AKfycbxpr2JiKv4exY0UrBrXrArLYTTi8Qxh3DrugG_anIjUReS0Y38zE3bqS9R0mb35brfUEA/exec";
    const url = `${baseUrl}?slug=${encodeURIComponent(slug)}`;
    console.log('Fetching event from URL:', url);
    const data = await this.fetchWithCache(url, false);
    console.log('API response:', data);
    
    // If API returns array, filter by slug
    if (data.data && Array.isArray(data.data)) {
      const foundEvent = data.data.find((event: any) => event.slug === slug);
      console.log('Filtered event by slug:', foundEvent);
      return foundEvent || null;
    }
    
    return data.data || null;
  }

  async fetchEventsByCategory(category: string): Promise<any[]> {
    const baseUrl = process.env.GEMITRA_EVENTS_URL || "https://script.google.com/macros/s/AKfycbxpr2JiKv4exY0UrBrXrArLYTTi8Qxh3DrugG_anIjUReS0Y38zE3bqS9R0mb35brfUEA/exec";
    const url = `${baseUrl}?category=${encodeURIComponent(category)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async incrementEventReader(eventId: string): Promise<any> {
    const baseUrl = process.env.GEMITRA_EVENTS_URL || "https://script.google.com/macros/s/AKfycbxpr2JiKv4exY0UrBrXrArLYTTi8Qxh3DrugG_anIjUReS0Y38zE3bqS9R0mb35brfUEA/exec";
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'increment_reader',
        eventId: eventId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export instances
export const apiService = new ApiService();
export const eventsApiService = new EventsApiService(); 