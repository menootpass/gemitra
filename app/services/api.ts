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
    
    // Debug: Log auth status (without exposing credentials)
    console.log('API Service initialized with auth:', {
      hasUsername: !!this.config.username,
      hasPassword: !!this.config.password,
      baseUrl: this.config.baseUrl
    });
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
      console.log('Using cached destinations data');
      return cached!.data;
    }

    try {
      console.log('Fetching destinations from API...');
      
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
        console.log('Using expired cache as fallback');
        return cached.data;
      }
      
      throw error;
    }
  }

  async purgeCache(): Promise<void> {
    // Fungsi ini mungkin perlu diubah atau dihapus jika tidak lagi relevan
    // dengan API handler yang baru. Untuk saat ini, kita akan menonaktifkannya
    // dengan mengosongkan isinya agar tidak menyebabkan error.
    console.log('Fungsi purgeCache dinonaktifkan untuk API handler lokal.');
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
    console.log('Local cache cleared');
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
}

// Export singleton instance
export const apiService = new ApiService(); 