"use client";
import { useState } from "react";
import Image from "next/image";

type ImageSliderProps = {
  images: string[];
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function ImageSlider({ images, alt, className = "", priority = false }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize images: flatten nested stringified arrays and filter valid URLs
  const normalized: string[] = Array.isArray(images)
    ? images.flatMap((src) => {
        if (typeof src !== 'string') return [];
        const s = src.trim();
        if (s.startsWith('[') && s.endsWith(']')) {
          try {
            const parsed = JSON.parse(s);
            if (Array.isArray(parsed)) {
              return parsed.filter((u: any) => typeof u === 'string');
            }
          } catch {
            // ignore
          }
        }
        return [s];
      })
      .filter((u) => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('/')))
    : [];

  if (!normalized || normalized.length === 0) {
    return (
      <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-2">🏞️</div>
          <div className="text-sm">No Image</div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Main Image */}
      <Image 
        src={normalized[currentIndex]} 
        alt={`${alt} ${currentIndex + 1}`}
        fill 
        priority={priority}
        className="object-cover w-full h-full"
        onError={(e) => {
          console.error('Image failed to load:', normalized[currentIndex]);
          // Fallback to "No Image" display
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                <div class="text-gray-500 text-center">
                  <div class="text-4xl mb-2">🏞️</div>
                  <div class="text-sm">Image Error</div>
                </div>
              </div>
            `;
          }
        }}
      />
      
      {/* Navigation Controls */}
      {normalized.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            aria-label="Previous image"
          >
            ←
          </button>
          
          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
            aria-label="Next image"
          >
            →
          </button>
          
          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentIndex + 1} / {normalized.length}
          </div>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
            {normalized.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
} 