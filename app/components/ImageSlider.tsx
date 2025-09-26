"use client";
import { useState } from "react";
import Image from "next/image";
import { normalizeImageUrls, handleImageError } from "../utils/imageUtils";
import LazyImage from "./LazyImage";

type ImageSliderProps = {
  images: string[];
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function ImageSlider({ images, alt, className = "", priority = false }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Normalize images using utility function
  const normalized: string[] = normalizeImageUrls(images);

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
      <LazyImage 
        src={normalized[currentIndex]} 
        alt={`${alt} ${currentIndex + 1}`}
        className="object-cover"
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={85}
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