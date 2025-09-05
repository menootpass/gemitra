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

export default function GemitraMap({ destinations, onDestinationClick, selectedDestination }: GemitraMapProps) {
  const [isMapReady, setIsMapReady] = useState(false);
  const [gemitraIcon, setGemitraIcon] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Handle map ready event
  const handleMapReady = () => {
    try {
      setIsMapReady(true);
      // Create custom icon immediately
      createGemitraIcon();
    } catch (error) {
      console.warn('Error in handleMapReady:', error);
    }
  };



  // Set client-side flag immediately
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsMapReady(false);
      setGemitraIcon(null);
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
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
          });
        }

        // Custom icon for Gemitra destinations
        if (L.divIcon) {
          const icon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: #16A86E; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #213DFF; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">G</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          setGemitraIcon(icon);
        }
      }
    } catch (error) {
      console.warn('Error creating map icon:', error);
    }
  };

  // Yogyakarta center coordinates
  const yogyakartaCenter: [number, number] = [-7.7971, 110.3708];

  // Filter destinations with valid positions
  const validDestinations = destinations.filter(dest => dest.posisi && Array.isArray(dest.posisi) && dest.posisi.length === 2);

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
                <div className="text-gray-500">Loading map...</div>
              </div>
            )}
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
              preferCanvas={true}
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
                           {destination.pengunjung !== undefined && (
                             <p className="text-xs text-[#213DFF] font-semibold">
                               👥 {destination.pengunjung.toLocaleString()}
                             </p>
                           )}
                         </div>
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