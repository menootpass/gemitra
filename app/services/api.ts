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
      baseUrl: 'https://sheetdb.io/api/v1/7ske65b4rjfi4',
      username: process.env.NEXT_PUBLIC_SHEETDB_USERNAME || '',
      password: process.env.NEXT_PUBLIC_SHEETDB_PASSWORD || '',
      cacheDuration: 5 * 60 * 1000, // 5 menit cache
    };
    
    // Debug: Log auth status (without exposing credentials)
    console.log('API Service initialized with auth:', {
      hasUsername: !!this.config.username,
      hasPassword: !!this.config.password,
      baseUrl: this.config.baseUrl
    });
  }

  private getAuthHeaders(): HeadersInit {
    if (this.config.username && this.config.password) {
      const credentials = btoa(`${this.config.username}:${this.config.password}`);
      console.log('Using Basic Auth with credentials');
      return {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      };
    }
    console.log('No auth credentials found, using public access');
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
      console.log('Using cached destinations data');
      return cached!.data;
    }

    try {
      console.log('Fetching destinations from API...');
      
      // Try with auth first
      let response = await fetch(this.config.baseUrl, {
        headers: this.getAuthHeaders(),
      });

      // If auth fails, try without auth
      if (response.status === 401) {
        console.log('Auth failed, trying public access...');
        response = await fetch(this.config.baseUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      
      // Return cached data if available, even if expired
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('Using expired cache as fallback');
        return cached.data;
      }
      
      throw error;
    }
  }

  async purgeCache(): Promise<void> {
    try {
      const purgeUrl = `${this.config.baseUrl}/cache/purge/3dd6b48b`;
      const response = await fetch(purgeUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        console.log('Cache purged successfully');
        this.cache.clear(); // Clear local cache too
      } else {
        console.warn('Failed to purge cache:', response.status);
      }
    } catch (error) {
      console.error('Error purging cache:', error);
    }
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
    console.log('Local cache cleared');
  }
}

// Export singleton instance
export const apiService = new ApiService(); 