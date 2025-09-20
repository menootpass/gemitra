"use client";
import { useEffect } from "react";
import { Destination } from "../types";

interface MapDiagnosticsProps {
  destinations: Destination[];
}

export default function MapDiagnostics({ destinations }: MapDiagnosticsProps) {
  useEffect(() => {
    console.log("🔍 ==================== MAP DIAGNOSTICS ====================");
    console.log("📊 Total destinations:", destinations.length);
    console.log("🕒 Timestamp:", new Date().toISOString());
    
    if (destinations.length > 0) {
      console.log("📋 First 3 destinations:");
      destinations.slice(0, 3).forEach((dest, index) => {
        console.log(`${index + 1}. ${dest.nama}:`, {
          id: dest.id,
          posisi: dest.posisi,
          posisiType: typeof dest.posisi,
          posisiIsArray: Array.isArray(dest.posisi),
          slug: dest.slug
        });
      });
      
      const destinationsWithPosition = destinations.filter(dest => dest.posisi);
      console.log(`📍 Destinations with posisi field: ${destinationsWithPosition.length}/${destinations.length}`);
      
      const validPositions = destinations.filter(dest => {
        if (!dest.posisi) return false;
        
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
            // Invalid JSON
          }
        }
        
        if (position) {
          const [lat, lng] = position;
          const isValidLat = lat >= -11 && lat <= 6; // Indonesia latitude range
          const isValidLng = lng >= 95 && lng <= 141; // Indonesia longitude range
          return isValidLat && isValidLng;
        }
        
        return false;
      });
      
      console.log(`✅ Valid positions for map: ${validPositions.length}/${destinations.length}`);
      
      if (validPositions.length > 0) {
        console.log("📍 Valid destinations with positions:");
        validPositions.forEach((dest, index) => {
          let position = null;
          if (Array.isArray(dest.posisi)) {
            position = dest.posisi;
          } else if (typeof dest.posisi === 'string') {
            try {
              position = JSON.parse(dest.posisi);
            } catch (e) {
              // ignore
            }
          }
          console.log(`  ${index + 1}. ${dest.nama}: ${JSON.stringify(position)}`);
        });
      } else {
        console.log("❌ No destinations have valid positions for mapping");
        console.log("🔍 Sample posisi data:");
        destinations.slice(0, 5).forEach((dest, index) => {
          console.log(`  ${index + 1}. ${dest.nama}: posisi = ${JSON.stringify(dest.posisi)} (type: ${typeof dest.posisi})`);
        });
      }
    } else {
      console.log("❌ No destinations data received");
      console.log("🔍 Debugging info:");
      console.log("- destinations type:", typeof destinations);
      console.log("- destinations value:", destinations);
      console.log("- destinations is array:", Array.isArray(destinations));
    }
    
    console.log("🔍 ==================== END DIAGNOSTICS ====================");
  }, [destinations]);

  return null; // This is a diagnostic component, no UI
}
