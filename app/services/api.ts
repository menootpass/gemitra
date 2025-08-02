import { Destination, CartItem, Event } from '../types';

interface ApiConfig {
  baseUrl: string;
  username: string;
  password: string;
  cacheDuration: number; // dalam milidetik
}

class ApiService {
  private config: ApiConfig;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  constructor() {
    this.config = {
      baseUrl: '/api/destinations',
      username: process.env.NEXT_PUBLIC_SHEETDB_USERNAME || '',
      password: process.env.NEXT_PUBLIC_SHEETDB_PASSWORD || '',
      cacheDuration: 5 * 60 * 1000, // 5 menit cache
    };
    

  }

  private getAuthHeaders(): HeadersInit {
    // Menghapus logika otentikasi karena sekarang ditangani di backend (jika diperlukan)
    return {
      'Content-Type': 'application/json',
    };
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.config.cacheDuration;
  }

  private getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramString}`;
  }

  async fetchDestinations(useCache: boolean = true): Promise<any[]> {
    const cacheKey = this.getCacheKey('destinations');
    
    // Check cache first
    if (useCache && this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      return cached!.data;
    }

    try {
      
      const response = await fetch(this.config.baseUrl, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const result = data && Array.isArray(data.data) ? data.data : data;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      
      // Return cached data if available, even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached.data;
      }
      
      throw error;
    }
  }

  async purgeCache(): Promise<void> {
    // Fungsi ini mungkin perlu diubah atau dihapus jika tidak lagi relevan
    // dengan API handler yang baru. Untuk saat ini, kita akan menonaktifkannya
    // dengan mengosongkan isinya agar tidak menyebabkan error.
    this.cache.clear();
  }

  // Method untuk mendapatkan data dengan limit
  async fetchDestinationsWithLimit(limit: number = 6): Promise<any[]> {
    const allDestinations = await this.fetchDestinations();
    return allDestinations.slice(0, limit);
  }

  // Method untuk mendapatkan data berdasarkan kategori
  async fetchDestinationsByCategory(category: string): Promise<any[]> {
    const allDestinations = await this.fetchDestinations();
    return allDestinations.filter((item: any) => item.kategori === category);
  }

  // Method untuk mendapatkan data berdasarkan search term
  async searchDestinations(searchTerm: string): Promise<any[]> {
    const allDestinations = await this.fetchDestinations();
    const term = searchTerm.toLowerCase();
    return allDestinations.filter((item: any) => 
      item.nama.toLowerCase().includes(term) ||
      item.lokasi.toLowerCase().includes(term)
    );
  }

  // Method untuk mendapatkan detail destinasi berdasarkan ID
  async fetchDestinationById(id: number): Promise<any | null> {
    const allDestinations = await this.fetchDestinations();
    return allDestinations.find((item: any) => item.id == id) || null;
  }

  // Method untuk mendapatkan statistik cache
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Method untuk clear cache manual
  clearCache(): void {
    this.cache.clear();
  }

  async postTransaction(transactionData: any): Promise<any> {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengirim transaksi');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in postTransaction:', error);
      throw error;
    }
  }

  async postComment(commentData: {
    invoiceCode: string;
    komentar: string;
    rating: number;
    destinationId: number;
  }): Promise<any> {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengirim komentar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in postComment:', error);
      throw error;
    }
  }

  // Feedback API
  async submitFeedback(feedbackData: {
    nama: string;
    email: string;
    telepon?: string;
    kategori?: string;
    rating: number;
    pesan: string;
  }): Promise<any> {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Events API Service
class EventsApiService {
  private eventsUrl: string;

  constructor() {
    this.eventsUrl = process.env.NEXT_PUBLIC_GEMITRA_EVENTS_URL || 
                     'https://script.google.com/macros/s/AKfycbxpr2JiKv4exY0UrBrXrArLYTTi8Qxh3DrugG_anIjUReS0Y38zE3bqS9R0mb35brfUEA/exec';
  }

  async fetchEvents(): Promise<Event[]> {
    try {
      const response = await fetch(this.eventsUrl);
      
      if (!response.ok) {
        throw new Error(`Events API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Gagal mengambil data events');
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async fetchEventBySlug(slug: string): Promise<Event | null> {
    try {
      const events = await this.fetchEvents();
      return events.find(event => event.slug === slug) || null;
    } catch (error) {
      console.error('Error fetching event by slug:', error);
      throw error;
    }
  }

  async fetchEventsByCategory(category: string): Promise<Event[]> {
    try {
      const events = await this.fetchEvents();
      return events.filter(event => 
        event.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching events by category:', error);
      throw error;
    }
  }

  async incrementEventReader(slug: string): Promise<boolean> {
    try {
      const event = await this.fetchEventBySlug(slug);
      if (!event) {
        throw new Error('Event tidak ditemukan');
      }

      // Note: This would require a separate API endpoint for incrementing
      // For now, we'll just return true as the increment is handled server-side
      return true;
    } catch (error) {
      console.error('Error incrementing event reader:', error);
      throw error;
    }
  }
}

// Export events API service
export const eventsApiService = new EventsApiService(); 