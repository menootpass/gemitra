'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import LoadingSkeleton from './LoadingSkeleton';

// Lazy load GemitraMap component
const GemitraMap = dynamic(() => import('./GemitraMap'), {
  loading: () => <LoadingSkeleton type="map" />,
  ssr: false, // Disable SSR for map component to improve initial load
});

// Lazy load MapDiagnostics component
const MapDiagnostics = dynamic(() => import('./MapDiagnostics'), {
  loading: () => null,
  ssr: false,
});

interface LazyMapProps {
  destinations: any[];
  onDestinationClick: (destination: any) => void;
  selectedDestination: any;
  loading?: boolean;
  error?: string | null;
  refresh?: () => void;
  isOnline?: boolean;
  retryCount?: number;
}

export default function LazyMap({
  destinations,
  onDestinationClick,
  selectedDestination,
  loading,
  error,
  refresh,
  isOnline,
  retryCount
}: LazyMapProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Intersection Observer untuk lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        threshold: 0.1, // Load when 10% visible
        rootMargin: '100px', // Start loading 100px before it comes into view
      }
    );

    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      observer.observe(mapContainer);
    }

    return () => {
      if (mapContainer) {
        observer.unobserve(mapContainer);
      }
    };
  }, [hasLoaded]);

  return (
    <div id="map-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {!isVisible ? (
        <div className="bg-gray-100 rounded-xl p-6 text-center min-h-[400px] flex items-center justify-center">
          <div className="text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#213DFF] mx-auto mb-4"></div>
            <p>Loading map...</p>
          </div>
        </div>
      ) : loading ? (
        <LoadingSkeleton type="map" />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-500 mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-red-800 font-semibold mb-2">Failed to Load Map Data</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={refresh}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Retrying...' : 'Try Again'}
            </button>
            {!isOnline && (
              <span className="text-red-500 text-sm self-center">
                📶 Check your internet connection
              </span>
            )}
          </div>
          {retryCount && retryCount > 0 && (
            <p className="text-red-500 text-xs mt-2">
              Retry attempt: {retryCount}/3
            </p>
          )}
        </div>
      ) : (
        <GemitraMap
          destinations={destinations}
          onDestinationClick={onDestinationClick}
          selectedDestination={selectedDestination}
        />
      )}
      
      {/* MapDiagnostics hanya load setelah map ter-load */}
      {isVisible && destinations.length > 0 && (
        <MapDiagnostics destinations={destinations} />
      )}
    </div>
  );
}
