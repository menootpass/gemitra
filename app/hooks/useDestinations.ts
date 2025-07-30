import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Destination } from '../types';

interface UseDestinationsOptions {
  limit?: number;
  category?: string;
  searchTerm?: string;
  enableCache?: boolean;
}

interface UseDestinationsReturn {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
  cacheStats: { size: number; keys: string[] };
}

export function useDestinations(options: UseDestinationsOptions = {}): UseDestinationsReturn {
  const { limit, category, searchTerm, enableCache = true } = options;
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processData = useCallback((rawData: any[]): Destination[] => {
    return rawData.map((item: any) => ({
      ...item,
      img: item.img || null, // Ensure img is not empty string
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
  };
}

// Hook khusus untuk detail destinasi
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
        const processedData = {
          ...rawData,
          img: rawData.img || null, // Ensure img is not empty string
          fasilitas: rawData.fasilitas ? rawData.fasilitas.split(",") : [],
          komentar: rawData.komentar ? (() => {
            try {
              const parsed = JSON.parse(rawData.komentar);
              console.log('Parsed comments in hook:', parsed);
              return parsed;
            } catch (error) {
              console.error('Error parsing comments in hook:', error);
              return [];
            }
          })() : [],
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