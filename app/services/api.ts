// API Service untuk semua endpoint
export class ApiService {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit

  private async fetchWithCache(url: string, enableCache = true): Promise<any> {
    if (enableCache) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('Using cached data for:', url);
        return cached.data;
      }
    }

    console.log('Making API request to:', url);
    const response = await fetch(url);
    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    if (enableCache) {
      this.cache.set(url, { data, timestamp: Date.now() });
    }

    return data;
  }

  // Destinations API
  async fetchDestinations(enableCache = true): Promise<any[]> {
    const url = process.env.GEMITRA_DESTINATIONS_URL || 
                "https://script.google.com/macros/s/AKfycbwBtHw-f7gtdpgVFQGCwYA40BnEEy8tkcIQcSuMsZcwU2wAt7zb-grUOz0W-a5zhAXK/exec";
    console.log('Fetching destinations from URL:', url);
    console.log('Environment variable GEMITRA_DESTINATIONS_URL:', process.env.GEMITRA_DESTINATIONS_URL);
    
    try {
    const data = await this.fetchWithCache(url, enableCache);
      console.log('Destinations API response:', data);
      console.log('Destinations data.data:', data.data);
      console.log('Destinations data.data length:', data.data?.length);
      console.log('Destinations data.data type:', typeof data.data);
      console.log('Destinations data.data is array:', Array.isArray(data.data));
      
      if (data.data && Array.isArray(data.data)) {
        console.log('✅ Destinations data.data is valid array');
        console.log('First destination in data.data:', data.data[0]);
        console.log('All destination names in data.data:', data.data.map((d: any) => d.nama));
        return data.data;
      } else {
        console.log('❌ Destinations data.data is not valid array');
        console.log('data.data:', data.data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  }

  async fetchDestinationsWithLimit(limit: number): Promise<any[]> {
    const baseUrl = process.env.GEMITRA_DESTINATIONS_URL || 
                   "https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec";
    const url = `${baseUrl}?limit=${limit}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async fetchDestinationsByCategory(category: string): Promise<any[]> {
    const baseUrl = process.env.GEMITRA_DESTINATIONS_URL || 
                   "https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec";
    const url = `${baseUrl}?category=${encodeURIComponent(category)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async searchDestinations(query: string): Promise<any[]> {
    const baseUrl = process.env.GEMITRA_DESTINATIONS_URL || 
                   "https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec";
    const url = `${baseUrl}?search=${encodeURIComponent(query)}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || [];
  }

  async fetchDestinationById(id: number): Promise<any> {
    const baseUrl = process.env.GEMITRA_DESTINATIONS_URL || 
                   "https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec";
    const url = `${baseUrl}?id=${id}`;
    const data = await this.fetchWithCache(url, false);
    return data.data || null;
  }

  async fetchDestinationBySlug(slug: string): Promise<any> {
    const baseUrl = process.env.GEMITRA_DESTINATIONS_URL || 
                   "https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec";
    const url = `${baseUrl}?slug=${encodeURIComponent(slug)}`;
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
    console.log('Environment variable GEMITRA_EVENTS_URL:', process.env.GEMITRA_EVENTS_URL);
    
    const data = await this.fetchWithCache(url, false);
    console.log('API response:', data);
    console.log('API response.data:', data.data);
    console.log('API response.data type:', typeof data.data);
    console.log('API response.data is array:', Array.isArray(data.data));
    
    // If API returns array, filter by slug
    if (data.data && Array.isArray(data.data)) {
      console.log('✅ API returned array of events');
      console.log('All events in array:', data.data);
      console.log('Looking for event with slug:', slug);
      
      const foundEvent = data.data.find((event: any) => event.slug === slug);
      console.log('Found event by slug:', foundEvent);
      
      if (foundEvent) {
        console.log('✅ Event found! Event keys:', Object.keys(foundEvent));
        console.log('Event destinasi:', foundEvent.destinasi);
        console.log('Event destinasi type:', typeof foundEvent.destinasi);
        console.log('Event destinasi is array:', Array.isArray(foundEvent.destinasi));
      } else {
        console.log('❌ Event not found with slug:', slug);
        console.log('Available slugs:', data.data.map((e: any) => e.slug));
      }
      
      return foundEvent || null;
    } else if (data.data && typeof data.data === 'object') {
      console.log('✅ API returned single event object');
      console.log('Event keys:', Object.keys(data.data));
      console.log('Event destinasi:', data.data.destinasi);
      console.log('Event destinasi type:', typeof data.data.destinasi);
      console.log('Event destinasi is array:', Array.isArray(data.data.destinasi));
      return data.data;
    } else {
      console.log('❌ API returned unexpected data format');
      console.log('Data format:', typeof data.data);
      return null;
    }
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