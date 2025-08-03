import useSWR, { SWRConfiguration } from 'swr';
import { Destination } from '../types';
import { apiService } from '../services/api';

// Helper function untuk generate slug dari nama
function generateSlugFromNama(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim(); // Remove leading/trailing hyphens
}

interface UseDestinationsSWROptions {
  limit?: number;
  category?: string;
  searchTerm?: string;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
}

interface UseDestinationsSWRReturn {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  mutate: () => Promise<any>;
  isValidating: boolean;
  lastUpdate: Date | null;
}

// Custom fetcher untuk destinations
const destinationsFetcher = async (key: string) => {
  const params = new URLSearchParams(key);
  const limit = params.get('limit');
  const category = params.get('category');
  const searchTerm = params.get('searchTerm');

  if (category) {
    return await apiService.fetchDestinationsByCategory(category);
  } else if (searchTerm) {
    return await apiService.searchDestinations(searchTerm);
  } else if (limit) {
    return await apiService.fetchDestinationsWithLimit(parseInt(limit));
  } else {
    return await apiService.fetchDestinations(false); // Disable cache untuk SWR
  }
};

export function useDestinationsSWR(options: UseDestinationsSWROptions = {}): UseDestinationsSWRReturn {
  const {
    limit,
    category,
    searchTerm,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval = 30000, // 30 detik default
  } = options;

  // Build cache key
  const cacheKey = `/api/destinations?${new URLSearchParams({
    ...(limit && { limit: limit.toString() }),
    ...(category && { category }),
    ...(searchTerm && { searchTerm }),
  }).toString()}`;

  // SWR configuration
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus,
    revalidateOnReconnect,
    refreshInterval,
    dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  };

  const { data, error, mutate, isValidating } = useSWR(
    cacheKey,
    destinationsFetcher,
    swrConfig
  );

  // Process data similar to original hook
  const processData = (rawData: any[]): Destination[] => {
    return rawData.map((item: any) => ({
      ...item,
      img: (() => {
        if (!item.img) return null;
        
        if (Array.isArray(item.img) && item.img.length > 0) {
          return item.img;
        }
        
        if (typeof item.img === 'string') {
          try {
            const parsed = JSON.parse(item.img);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
          } catch {
            try {
              const cleaned = item.img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
              const parsed = JSON.parse(cleaned);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
            } catch {
              // Failed to parse even after cleaning
            }
          }
          
          if (item.img.startsWith('[') && item.img.endsWith(']')) {
            try {
              const urlMatches = item.img.match(/https?:\/\/[^\s,\]]+/g);
              if (urlMatches && urlMatches.length > 0) {
                return urlMatches;
              }
            } catch {
              // Failed to extract URLs
            }
            
            try {
              const content = item.img.slice(1, -1);
              const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
              const validUrls = urls.filter((url: string) => url.startsWith('http'));
              if (validUrls.length > 0) {
                return validUrls;
              }
            } catch {
              // Failed manual extraction
            }
            
            // Additional parsing for array format like [url1, url2]
            try {
              const content = item.img.slice(1, -1);
              const urls = content.split(',').map((url: string) => {
                const trimmed = url.trim();
                return trimmed.replace(/^["']|["']$/g, '');
              });
              const validUrls = urls.filter((url: string) => url.startsWith('http'));
              if (validUrls.length > 0) {
                return validUrls;
              }
            } catch {
              // Failed additional parsing
            }
          }
          
          if (item.img.startsWith('http://') || item.img.startsWith('https://')) {
            return [item.img];
          }
          return null;
        }
        
        return null;
      })(),
      fasilitas: item.fasilitas ? item.fasilitas.split(",") : [],
      komentar: item.komentar ? (() => {
        try {
          return JSON.parse(item.komentar);
        } catch {
          return [];
        }
      })() : [],
      posisi: item.posisi ? (() => {
        try {
          const match = item.posisi.match(/-?\d+\.\d+/g);
          if (match && match.length === 2) {
            return [parseFloat(match[0]), parseFloat(match[1])];
          }
          return undefined;
        } catch {
          return undefined;
        }
      })() : undefined,
      pengunjung: item.dikunjungi ? parseInt(item.dikunjungi) || 0 : 0,
      slug: item.slug || generateSlugFromNama(item.nama),
    })) as Destination[];
  };

  const destinations = data ? processData(data) : [];
  const loading = !data && !error;
  const errorMessage = error ? error.message : null;

  return {
    destinations,
    loading,
    error: errorMessage,
    mutate,
    isValidating,
    lastUpdate: data ? new Date() : null,
  };
} 