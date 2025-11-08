"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Destination } from "../types";
import MapErrorBoundary from "./MapErrorBoundary";

// Add Leaflet CSS
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Dynamic import untuk komponen Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

type GemitraMapProps = {
  destinations: Destination[];
  onDestinationClick: (destination: Destination) => void;
  selectedDestination?: Destination | null;
};

export default function GemitraMap({ destinations, onDestinationClick, selectedDestination }: GemitraMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [gemitraIcon, setGemitraIcon] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerKeyRef = useRef<string>(`gemitra-map-${Date.now()}`);

  // Handle map ready event
  const handleMapReady = () => {
    try {
      setIsMapReady(true);
      // Create custom icon with delay to ensure Leaflet is fully loaded
      setTimeout(() => {
        createGemitraIcon();
      }, 100);
    } catch (error) {
      console.warn('Error in handleMapReady:', error);
    }
  };



  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMapReady(false);
      setGemitraIcon(null);
      if (mapRef.current && typeof mapRef.current.off === 'function') {
        mapRef.current.off();
      }
      if (mapRef.current && typeof mapRef.current.remove === 'function') {
        mapRef.current.remove();
      }
      mapRef.current = null;
    };
  }, []);

  // Create custom Gemitra icon when map is ready
  const createGemitraIcon = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).L) {
        const L = (window as any).L;
        
        // Fix for default markers in react-leaflet
        if (L.Icon && L.Icon.Default && L.Icon.Default.prototype) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });
        }

        // Custom icon dengan logo "G" Gemitra
        if (L.divIcon) {
          const icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background: linear-gradient(135deg, #16A86E 0%, #213DFF 100%); width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 18px; box-shadow: 0 4px 12px rgba(33, 61, 255, 0.4); position: relative; font-family: 'Arial Black', Arial, sans-serif;">
              G
              <div style="position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 10px solid #213DFF;"></div>
            </div>`,
            iconSize: [36, 46],
            iconAnchor: [18, 46],
          });

          setGemitraIcon(icon);
        }
      } else {
        console.warn('⚠️ Leaflet not available, retrying in 500ms...');
        setTimeout(createGemitraIcon, 500);
      }
    } catch (error) {
      console.error('❌ Error creating map icon:', error);
      // Fallback: try again in 1 second
      setTimeout(createGemitraIcon, 1000);
    }
  };

  // Yogyakarta center coordinates
  const yogyakartaCenter: [number, number] = [-7.7971, 110.3708];

  // Filter destinations with valid positions with better validation
  const validDestinations = destinations.filter(dest => {
    if (!dest.posisi) return false;
    
    // Handle both array and string formats
    let position: [number, number] | null = null;
    
    if (Array.isArray(dest.posisi)) {
      if (dest.posisi.length === 2 && 
          typeof dest.posisi[0] === 'number' && 
          typeof dest.posisi[1] === 'number' &&
          !isNaN(dest.posisi[0]) && !isNaN(dest.posisi[1])) {
        position = dest.posisi as [number, number];
      }
    } else if (typeof dest.posisi === 'string') {
      try {
        const parsed = JSON.parse(dest.posisi);
        if (Array.isArray(parsed) && parsed.length === 2 && 
            typeof parsed[0] === 'number' && typeof parsed[1] === 'number' &&
            !isNaN(parsed[0]) && !isNaN(parsed[1])) {
          position = parsed as [number, number];
        }
      } catch (e) {
        console.warn(`Invalid position data for ${dest.nama}:`, dest.posisi);
      }
    }
    
    // Validate coordinate ranges (rough bounds for Indonesia)
    if (position) {
      const [lat, lng] = position;
      const isValidLat = lat >= -11 && lat <= 6; // Indonesia latitude range
      const isValidLng = lng >= 95 && lng <= 141; // Indonesia longitude range
      
      if (!isValidLat || !isValidLng) {
        console.warn(`Invalid coordinates for ${dest.nama}: [${lat}, ${lng}]`);
        return false;
      }
      
      return true;
    }
    
    return false;
  });
  
  

  return (
    <MapErrorBoundary>
      <div className="w-full h-96 rounded-xl overflow-hidden shadow-xl border-2 border-[#213DFF22]">
        {!isClient ? (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Loading map...</div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            {!isMapReady && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
                <div className="text-gray-500 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16A86E] mb-2"></div>
                  <span>Initializing map...</span>
                </div>
              </div>
            )}
            <MapContainer
              key={mapContainerKeyRef.current}
              whenCreated={(mapInstance) => {
                mapRef.current = mapInstance;
              }}
              center={yogyakartaCenter}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
              whenReady={handleMapReady}
              zoomControl={true}
              doubleClickZoom={false}
              scrollWheelZoom={true}
              dragging={true}
              touchZoom={true}
              boxZoom={false}
              keyboard={false}
              preferCanvas={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {isMapReady && gemitraIcon && validDestinations.map((destination) => {
                // Get position safely
                let position: [number, number] | null = null;
                
                if (Array.isArray(destination.posisi)) {
                  position = destination.posisi as [number, number];
                } else if (typeof destination.posisi === 'string') {
                  try {
                    const parsed = JSON.parse(destination.posisi);
                    if (Array.isArray(parsed) && parsed.length === 2) {
                      position = parsed as [number, number];
                    }
                  } catch (e) {
                    console.warn(`Failed to parse position for ${destination.nama}`);
                    return null;
                  }
                }
                
                if (!position) {
                  return null;
                }

                try {
                  return (
                    <Marker
                      key={`marker-${destination.id}`}
                      position={position}
                      icon={gemitraIcon}
                      eventHandlers={{
                        click: () => {
                          onDestinationClick(destination);
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-center p-3 min-w-[200px]">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-[#213DFF] text-sm flex-1 text-left">{destination.nama}</h3>
                            <Link
                              href={`/wisata/${destination.slug}`}
                              className="bg-[#16A86E] text-white text-xs px-2 py-1 rounded-md hover:bg-[#213DFF] transition-colors ml-2 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Detail
                            </Link>
                          </div>
                          <p className="text-xs text-gray-600 text-left">{destination.lokasi}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-[#16A86E] font-bold">{destination.rating}★</p>
                            {destination.dikunjungi !== undefined && (
                              <p className="text-xs text-[#213DFF] font-semibold">
                                👥 {destination.dikunjungi.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                } catch (error) {
                  console.error('❌ Error rendering marker for destination:', destination.nama, error);
                  return null;
                }
              })}
            </MapContainer>
          </div>
        )}
        
        {/* Detail Button - appears below map when destination is selected */}
        {selectedDestination && (
          <div className="mt-4 flex justify-center">
            <Link
              href={`/wisata/${selectedDestination.slug}`}
              className="bg-[#16A86E] text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-[#213DFF] transition flex items-center gap-2"
            >
              <span>🗺️</span>
              Detail Destinasi: {selectedDestination.nama}
            </Link>
          </div>
        )}
        
      </div>
    </MapErrorBoundary>
  );
} 