import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Destination } from '../types';

interface UseDestinationsOptions {
  limit?: number;
  category?: string;
  searchTerm?: string;
  enableCache?: boolean;
  enablePolling?: boolean;
  pollingInterval?: number;
}

interface UseDestinationsReturn {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
  cacheStats: { size: number; keys: string[] };
  lastUpdate: Date;
}

export function useDestinations(options: UseDestinationsOptions = {}): UseDestinationsReturn {
  const { 
    limit, 
    category, 
    searchTerm, 
    enableCache = true, 
    enablePolling = false, 
    pollingInterval = 30000 // 30 detik default
  } = options;
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const processData = useCallback((rawData: any[]): Destination[] => {
    return rawData.map((item: any) => ({
      ...item,
      img: (() => {
        // Handle img field - could be array, string, or null
        if (!item.img) return null;
        
        // If img is already an array, return the whole array
        if (Array.isArray(item.img) && item.img.length > 0) {
          return item.img;
        }
        
        // If img is a string, it might be a JSON array string
        if (typeof item.img === 'string') {
          // Try to parse as JSON array first
          try {
            const parsed = JSON.parse(item.img);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return parsed;
            }
          } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            // If JSON parsing fails, try to clean the string first
            try {
              // Remove any problematic characters and try again
              const cleaned = item.img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
              const parsed = JSON.parse(cleaned);
              if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
              }
            } catch (e2) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              // Failed to parse even after cleaning
            }
          }
          
          // Check if it looks like an array string (starts with [ and ends with ])
          if (item.img.startsWith('[') && item.img.endsWith(']')) {
            try {
              // Try to extract URLs from the string manually
              const urlMatches = item.img.match(/https?:\/\/[^\s,\]]+/g);
              if (urlMatches && urlMatches.length > 0) {
                return urlMatches;
              }
            } catch (e) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              // Failed to extract URLs
            }
            
            // If regex extraction fails, try manual parsing
            try {
              // Remove brackets and split by comma
              const content = item.img.slice(1, -1); // Remove [ and ]
              const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
              const validUrls = urls.filter((url: string) => url.startsWith('http'));
              if (validUrls.length > 0) {
                return validUrls;
              }
            } catch (e) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              // Failed manual extraction
            }
            
            // Additional parsing for array format like [url1, url2]
            try {
              // Remove brackets and split by comma, handling quotes
              const content = item.img.slice(1, -1); // Remove [ and ]
              const urls = content.split(',').map((url: string) => {
                const trimmed = url.trim();
                // Remove quotes if present
                return trimmed.replace(/^["']|["']$/g, '');
              });
              const validUrls = urls.filter((url: string) => url.startsWith('http'));
              if (validUrls.length > 0) {
                return validUrls;
              }
            } catch (e) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              // Failed additional parsing
            }
          }
          
          // If it's a valid URL, return it as array
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
          // Asumsi item.posisi adalah string seperti "[-7.711445, 110.286139]"
          const match = item.posisi.match(/-?\d+\.\d+/g);
          if (match && match.length === 2) {
            return [parseFloat(match[0]), parseFloat(match[1])];
          }
          return undefined;
        } catch {
          return undefined;
        }
      })() : undefined
    })) as Destination[];
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let rawData: any[];

      if (category) {
        rawData = await apiService.fetchDestinationsByCategory(category);
      } else if (searchTerm) {
        rawData = await apiService.searchDestinations(searchTerm);
      } else if (limit) {
        rawData = await apiService.fetchDestinationsWithLimit(limit);
      } else {
        rawData = await apiService.fetchDestinations(enableCache);
      }

      const processedData = processData(rawData);
      setDestinations(processedData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      console.error('Error in useDestinations:', err);
    } finally {
      setLoading(false);
    }
  }, [limit, category, searchTerm, enableCache, processData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const clearCache = useCallback(() => {
    apiService.clearCache();
  }, []);

  // Polling effect untuk real-time updates
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      fetchData();
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, fetchData]);

  // Visibility change listener untuk update saat user kembali ke tab
  useEffect(() => {
    if (!enablePolling) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enablePolling, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    destinations,
    loading,
    error,
    refresh,
    clearCache,
    cacheStats: apiService.getCacheStats(),
    lastUpdate,
  };
}

// Hook khusus untuk detail destinasi berdasarkan ID
export function useDestinationDetail(id: number | null) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDestination = useCallback(async (destinationId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const rawData = await apiService.fetchDestinationById(destinationId);
      
      if (rawData) {
        // console.log('Raw data in useDestinationDetail:', rawData);
        // console.log('Raw komentar data:', rawData.komentar, 'Type:', typeof rawData.komentar);
        const processedData = {
          ...rawData,
          img: (() => {
            // Handle img field - could be array, string, or null
            if (!rawData.img) return null;
            
            // If img is already an array, return the whole array
            if (Array.isArray(rawData.img) && rawData.img.length > 0) {
              return rawData.img;
            }
            
            // If img is a string, it might be a JSON array string
            if (typeof rawData.img === 'string') {
              // Try to parse as JSON array first
              try {
                const parsed = JSON.parse(rawData.img);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  return parsed;
                }
              } catch (e) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                // If JSON parsing fails, try to clean the string first
                try {
                  // Remove any problematic characters and try again
                  const cleaned = rawData.img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
                  const parsed = JSON.parse(cleaned);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                  }
                } catch (e2) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  // Failed to parse even after cleaning
                }
              }
              
              // Check if it looks like an array string (starts with [ and ends with ])
              if (rawData.img.startsWith('[') && rawData.img.endsWith(']')) {
                try {
                  // Try to extract URLs from the string manually
                  const urlMatches = rawData.img.match(/https?:\/\/[^\s,\]]+/g);
                  if (urlMatches && urlMatches.length > 0) {
                    return urlMatches;
                  }
                } catch (e) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  // Failed to extract URLs
                }
                
                // If regex extraction fails, try manual parsing
                try {
                  // Remove brackets and split by comma
                  const content = rawData.img.slice(1, -1); // Remove [ and ]
                  const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
                  const validUrls = urls.filter((url: string) => url.startsWith('http'));
                  if (validUrls.length > 0) {
                    return validUrls;
                  }
                } catch (e) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  // Failed manual extraction
                }
              }
              
              // If it's a valid URL, return it as array
              if (rawData.img.startsWith('http://') || rawData.img.startsWith('https://')) {
                return [rawData.img];
              }
              return null;
            }
            
            return null;
          })(),
          fasilitas: rawData.fasilitas ? rawData.fasilitas.split(",") : [],
          komentar: (() => {
            try {
              if (!rawData.komentar) return [];
              if (Array.isArray(rawData.komentar)) return rawData.komentar;
              if (typeof rawData.komentar === 'string') {
                return JSON.parse(rawData.komentar);
              }
              return [];
            } catch {
              return [];
            }
          })(),
          posisi: rawData.posisi ? (() => {
            try {
              const match = rawData.posisi.match(/-?\d+\.\d+/g);
              if (match && match.length === 2) {
                return [parseFloat(match[0]), parseFloat(match[1])];
              }
              return undefined;
            } catch {
              return undefined;
            }
          })() : undefined
        } as Destination;
        
        setDestination(processedData);
      } else {
        setError('Destinasi tidak ditemukan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil detail destinasi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchDestination(id);
    } else {
      setDestination(null);
    }
  }, [id, fetchDestination]);

  return {
    destination,
    loading,
    error,
    refresh: () => id ? fetchDestination(id) : Promise.resolve(),
  };
}

// Hook khusus untuk detail destinasi berdasarkan slug
export function useDestinationDetailBySlug(slug: string | null) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDestinationBySlug = useCallback(async (slug: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/destinations?slug=${encodeURIComponent(slug)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch destination');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const rawData = result.data;
        const processedData = {
          ...rawData,
          img: (() => {
            if (!rawData.img) return null;
            
            if (Array.isArray(rawData.img) && rawData.img.length > 0) {
              return rawData.img;
            }
            
            if (typeof rawData.img === 'string') {
              try {
                const parsed = JSON.parse(rawData.img);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  return parsed;
                }
              } catch (e) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                try {
                  const cleaned = rawData.img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
                  const parsed = JSON.parse(cleaned);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                  }
                } catch (e2) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  // Failed to parse even after cleaning
                }
              }
              
              if (rawData.img.startsWith('[') && rawData.img.endsWith(']')) {
                try {
                  const urlMatches = rawData.img.match(/https?:\/\/[^\s,\]]+/g);
                  if (urlMatches && urlMatches.length > 0) {
                    return urlMatches;
                  }
                } catch (e) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  // Failed to extract URLs
                }
                
                try {
                  const content = rawData.img.slice(1, -1);
                  const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
                  const validUrls = urls.filter((url: string) => url.startsWith('http'));
                  if (validUrls.length > 0) {
                    return validUrls;
                  }
                } catch (e) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  // Failed manual extraction
                }
              }
              
              if (rawData.img.startsWith('http://') || rawData.img.startsWith('https://')) {
                return [rawData.img];
              }
              return null;
            }
            
            return null;
          })(),
          fasilitas: rawData.fasilitas ? rawData.fasilitas.split(",") : [],
          komentar: (() => {
            try {
              if (!rawData.komentar) return [];
              if (Array.isArray(rawData.komentar)) return rawData.komentar;
              if (typeof rawData.komentar === 'string') {
                return JSON.parse(rawData.komentar);
              }
              return [];
            } catch {
              return [];
            }
          })(),
          posisi: rawData.posisi ? (() => {
            try {
              const match = rawData.posisi.match(/-?\d+\.\d+/g);
              if (match && match.length === 2) {
                return [parseFloat(match[0]), parseFloat(match[1])];
              }
              return undefined;
            } catch {
              return undefined;
            }
          })() : undefined,
          pengunjung: rawData.dikunjungi ? parseInt(rawData.dikunjungi) || 0 : 0,
          slug: rawData.slug || '',
        } as Destination;
        
        setDestination(processedData);
      } else {
        setError('Destinasi tidak ditemukan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil detail destinasi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchDestinationBySlug(slug);
    } else {
      setDestination(null);
    }
  }, [slug, fetchDestinationBySlug]);

  return {
    destination,
    loading,
    error,
    refresh: () => slug ? fetchDestinationBySlug(slug) : Promise.resolve(),
  };
} 