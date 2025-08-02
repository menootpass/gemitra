"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Destination } from "../types";
import MapErrorBoundary from "./MapErrorBoundary";

// Add Leaflet CSS
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Dynamic import to avoid SSR issues with loading fallback
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

export default function GemitraMap({ destinations, onDestinationClick }: GemitraMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [gemitraIcon, setGemitraIcon] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Handle map ready event
  const handleMapReady = () => {
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
      setIsMapReady(true);
      // Create custom icon after map is ready
      setTimeout(() => {
        createGemitraIcon();
      }, 300);
    }, 100);
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
      setSelectedDestination(null);
    };
  }, []);

  // Create custom Gemitra icon when map is ready
  const createGemitraIcon = () => {
    try {
      if (typeof window !== 'undefined' && (window as any).L) {
        const L = (window as any).L;
        
        // Fix for default markers in react-leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });

        // Custom icon for Gemitra destinations
        const icon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: #16A86E; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #213DFF; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">G</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        setGemitraIcon(icon);
      }
    } catch (error) {
      console.warn('Error creating map icon:', error);
    }
  };

  // Yogyakarta center coordinates
  const yogyakartaCenter: [number, number] = [-7.7971, 110.3708];

  // Filter destinations with valid positions
  const validDestinations = destinations.filter(dest => dest.posisi && Array.isArray(dest.posisi) && dest.posisi.length === 2);

  // Don't render map until client-side
  if (!isClient) {
    return (
      <div className="w-full h-96 rounded-xl overflow-hidden shadow-xl border-2 border-[#213DFF22] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div className="w-full h-96 rounded-xl overflow-hidden shadow-xl border-2 border-[#213DFF22]">
        <MapContainer
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
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
                     {isMapReady && gemitraIcon && validDestinations.map((destination) => {
             // Double check position validity
             if (!destination.posisi || !Array.isArray(destination.posisi) || destination.posisi.length !== 2) {
               return null;
             }

             try {
               return (
                 <Marker
                   key={`marker-${destination.id}`}
                   position={destination.posisi as [number, number]}
                   icon={gemitraIcon}
                   eventHandlers={{
                     click: () => {
                       setSelectedDestination(destination);
                       onDestinationClick(destination);
                     },
                   }}
                 >
                 <Popup>
                       <div className="text-center p-2">
                         <h3 className="font-bold text-[#213DFF] text-sm">{destination.nama}</h3>
                         <p className="text-xs text-gray-600">{destination.lokasi}</p>
                         <p className="text-xs text-[#16A86E] font-bold">{destination.rating}★</p>
                         {destination.pengunjung !== undefined && (
                           <p className="text-xs text-[#213DFF] font-semibold mt-1">
                             👥 {destination.pengunjung.toLocaleString()}
                           </p>
                         )}
                       </div>
                 </Popup>
                   
                 </Marker>
               );
             } catch (error) {
               console.warn('Error rendering marker for destination:', destination.nama, error);
               return null;
             }
           })}
        </MapContainer>
        
        {/* Detail Button - appears below map when destination is selected */}
        {selectedDestination && (
          <div className="mt-4 flex justify-center">
            <Link
              href={`/wisata/${selectedDestination.slug || selectedDestination.id}`}
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