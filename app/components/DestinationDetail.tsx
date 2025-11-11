"use client";
import Link from "next/link";
import ImageSlider from "./ImageSlider";
import { Destination } from "../types";
import { useLanguage } from "../contexts/LanguageContext";
import { getPriceByLanguage, formatPrice } from "../utils/priceUtils";

type DestinationDetailProps = {
  destination: Destination | null;
  onClose: () => void;
};

export default function DestinationDetail({ destination, onClose }: DestinationDetailProps) {
  const { locale } = useLanguage();
  
  if (!destination) {
    return (
      <div className="w-full h-96 bg-glass rounded-xl flex items-center justify-center">
        <div className="text-center text-black/60">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-bold text-[#213DFF] mb-2">Peta Destinasi Gemitra</h3>
          <p className="text-sm">Klik pin di peta untuk melihat detail destinasi</p>
        </div>
      </div>
    );
  }

  // Function to process image data
  const processImageData = (img: any) => {
    if (!img) return [];
    if (Array.isArray(img) && img.length > 0) {
      return img;
    }
    if (typeof img === 'string') {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        try {
          const cleaned = img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // Failed to parse even after cleaning
        }
      }
      
      if (img.startsWith('[') && img.endsWith(']')) {
        try {
          const urlMatches = img.match(/https?:\/\/[^\s,\]]+/g);
          if (urlMatches && urlMatches.length > 0) {
            return urlMatches;
          }
        } catch {
          // Failed to extract URLs
        }
        
        try {
          const content = img.slice(1, -1);
          const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
          const validUrls = urls.filter((url: string) => url.startsWith('http'));
          if (validUrls.length > 0) {
            return validUrls;
          }
        } catch {
          // Failed manual extraction
        }
        
        // Additional parsing for array format like [url1, url2]
        try {
          const content = img.slice(1, -1);
          const urls = content.split(',').map((url: string) => {
            const trimmed = url.trim();
            return trimmed.replace(/^["']|["']$/g, '');
          });
          const validUrls = urls.filter((url: string) => url.startsWith('http'));
          if (validUrls.length > 0) {
            return validUrls;
          }
        } catch {
          // Failed additional parsing
        }
      }
      
      if (img.startsWith('http://') || img.startsWith('https://')) {
        return [img];
      }
      if (img.includes('drive.google.com')) {
        return [img];
      }
      if (img.includes('.com') || img.includes('.org') || img.includes('.net')) {
        return [`https://${img}`];
      }
      return [];
    }
    return [];
  };

  return (
    <div className="w-full bg-glass rounded-3xl overflow-hidden shadow-xl">
      <div className="relative w-full h-64 sm:h-80">
        <ImageSlider 
          images={processImageData(destination.img)}
          alt={destination.nama}
          className="w-full h-full object-cover"
          priority={false}
        />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-white/90 text-[#213DFF] font-bold px-2 py-1 rounded-full text-xs hover:bg-white transition z-10"
          >
            ✕
          </button>
        </div>
      <div className="p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-extrabold text-[#213DFF] flex-1">{destination.nama}</h3>
          <div className="flex items-center gap-2">
            <Link
              href={`/wisata/${destination.slug}`}
              className="bg-[#16A86E] text-white text-xs px-3 py-1 rounded-md hover:bg-[#213DFF] transition-colors whitespace-nowrap shadow"
            >
              Detail
            </Link>
            <span className="text-[#16A86E] font-bold text-base">{destination.rating}★</span>
          </div>
        </div>
        <span className="text-black/60 text-sm">
          {destination.lokasi} &middot; {destination.kategori}
        </span>
        {(destination.harga || destination.mancanegara) && (
          <div className="flex items-center gap-2">
            <span className="text-[#16A86E] font-bold text-base">
              {formatPrice(getPriceByLanguage(destination, locale), locale)}
            </span>
            <span className="text-gray-500 text-xs">per destinasi</span>
          </div>
        )}
        {destination.deskripsi && (
          <p className="text-black/80 text-sm leading-relaxed line-clamp-4">
            {destination.deskripsi}
          </p>
        )}
        
        {/* Informasi Pengunjung */}
        {destination.dikunjungi !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#213DFF] font-semibold">👥</span>
            <span className="text-black/70">
              {destination.dikunjungi.toLocaleString()} pengunjung
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {(
            Array.isArray(destination.fasilitas)
              ? destination.fasilitas
              : String(destination.fasilitas || "").split(",")
          )
            .filter((f: string) => f.trim().length > 0)
            .slice(0, 4)
            .map((f: string, idx: number) => (
              <span key={f + idx} className="px-2 py-1 rounded-full bg-[#213DFF11] text-[#213DFF] text-xs font-semibold">
                {f.trim()}
              </span>
            ))}
          {(
            Array.isArray(destination.fasilitas)
              ? destination.fasilitas.length
              : String(destination.fasilitas || "").split(",").filter((f) => f.trim().length > 0).length
          ) > 4 && (
            <span className="px-2 py-1 rounded-full bg-[#16A86E11] text-[#16A86E] text-xs font-semibold">
              +{(
                Array.isArray(destination.fasilitas)
                  ? destination.fasilitas.length
                  : String(destination.fasilitas || "").split(",").filter((f) => f.trim().length > 0).length
              ) - 4} lagi
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            href={`/wisata/${destination.id}`}
            className="flex-1 bg-[#16A86E] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#213DFF] transition text-center text-sm"
          >
            Detail Lengkap
          </Link>
          <button className="bg-[#213DFF] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#16A86E] transition text-sm">
            +
          </button>
        </div>
      </div>
    </div>
  );
} 