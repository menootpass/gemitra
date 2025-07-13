"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Destination } from "../types";

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
  const [L, setL] = useState<any>(null);
  const [gemitraIcon, setGemitraIcon] = useState<any>(null);

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

  // Yogyakarta center coordinates
  const yogyakartaCenter: [number, number] = [-7.7971, 110.3708];

  // Sample coordinates for destinations (you can update these based on your data)
  const destinationCoordinates: { [key: number]: [number, number] } = {
    1: [-7.7971, 110.3708], // Yogyakarta City
    2: [-7.8021, 110.3788], // Near Malioboro
    3: [-7.7921, 110.3628], // Near Kraton
    4: [-7.8121, 110.3908], // Near Prambanan
    5: [-7.7821, 110.3508], // Near Parangtritis
    6: [-7.8221, 110.4008], // Near Borobudur area
    7: [-7.636703, 110.397306], // New location
  };

  if (!isClient || !L || !gemitraIcon) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden shadow-xl border-2 border-[#213DFF22]">
      <MapContainer
        center={yogyakartaCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {destinations.map((destination) => {
          const coords = destinationCoordinates[destination.id];
          if (!coords) return null;

          return (
            <Marker
              key={destination.id}
              position={coords}
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
  );
} 