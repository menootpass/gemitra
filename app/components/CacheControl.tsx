"use client";

import { useState } from 'react';
import { apiService } from '../services/api';

interface CacheControlProps {
  onRefresh?: () => void;
  className?: string;
}

export default function CacheControl({ onRefresh, className = "" }: CacheControlProps) {
  const [isPurging, setIsPurging] = useState(false);
  const [cacheStats, setCacheStats] = useState(apiService.getCacheStats());

  const handlePurgeCache = async () => {
    setIsPurging(true);
    try {
      await apiService.purgeCache();
      setCacheStats(apiService.getCacheStats());
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error purging cache:', error);
    } finally {
      setIsPurging(false);
    }
  };

  const handleClearLocalCache = () => {
    apiService.clearCache();
    setCacheStats(apiService.getCacheStats());
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 ${className}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#213DFF]">Cache Control</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Size: {cacheStats.size}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handlePurgeCache}
            disabled={isPurging}
            className="flex-1 bg-[#16A86E] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#213DFF] transition disabled:opacity-50"
          >
            {isPurging ? 'Purging...' : 'Purge Cache'}
          </button>
          <button
            onClick={handleClearLocalCache}
            className="flex-1 bg-[#213DFF] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#16A86E] transition"
          >
            Clear Local
          </button>
        </div>
        
        {cacheStats.keys.length > 0 && (
          <div className="text-xs text-gray-600">
            <div className="font-semibold mb-1">Cached Keys:</div>
            <div className="space-y-1">
              {cacheStats.keys.map((key, index) => (
                <div key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {key}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 