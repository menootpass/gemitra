"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Destination } from "../types";
import MapErrorBoundary from "./MapErrorBoundary";

// Dynamic import to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
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
  const [isClient, setIsClient] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [L, setL] = useState<any>(null);
  const [gemitraIcon, setGemitraIcon] = useState<any>(null);
  // const mapRef = useRef<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Import Leaflet library only on client side
    import("leaflet").then((leaflet) => {
      const L = leaflet.default;
      
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

      setL(L);
      setGemitraIcon(icon);
    });
  }, []);

  // Handle map ready event
  const handleMapReady = () => {
    setIsMapReady(true);
  };

  // Yogyakarta center coordinates
  const yogyakartaCenter: [number, number] = [-7.7971, 110.3708];

  // Show loading state until everything is ready
  if (!isClient || !L || !gemitraIcon) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Filter destinations with valid positions
  const validDestinations = destinations.filter(dest => dest.posisi && Array.isArray(dest.posisi) && dest.posisi.length === 2);

  return (
    <MapErrorBoundary>
      <div className="w-full h-96 rounded-xl overflow-hidden shadow-xl border-2 border-[#213DFF22]">
        <MapContainer
          center={yogyakartaCenter}
          zoom={10}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          whenReady={handleMapReady}
          key={isClient ? 'client' : 'server'} // Force re-render on client
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {isMapReady && validDestinations.map((destination) => {
            // Double check position validity
            if (!destination.posisi || !Array.isArray(destination.posisi) || destination.posisi.length !== 2) {
              return null;
            }

            return (
              <Marker
                key={`marker-${destination.id}`}
                position={destination.posisi as [number, number]}
                icon={gemitraIcon}
                eventHandlers={{
                  click: () => onDestinationClick(destination),
                }}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold text-[#213DFF] text-sm">{destination.nama}</h3>
                    <p className="text-xs text-gray-600">{destination.lokasi}</p>
                    <p className="text-xs text-[#16A86E] font-bold">{destination.rating}★</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </MapErrorBoundary>
  );
} 