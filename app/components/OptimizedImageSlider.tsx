"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { normalizeImageUrls } from "../utils/imageUtils";

type OptimizedImageSliderProps = {
  images: string[];
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export default function OptimizedImageSlider({ 
  images, 
  alt, 
  className = "", 
  priority = false,
  sizes = "(max-width: 768px) 100vw, 80vw"
}: OptimizedImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Normalize images using utility function
  const normalized: string[] = normalizeImageUrls(images);

  useEffect(() => {
    if (priority) {
      setIsLoaded(true);
    }
  }, [priority]);

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
    setCurrentIndex((prev) => (prev + 1) % normalized.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + normalized.length) % normalized.length);
  };

  return (
    <div className={`relative w-full h-full ${className}`} style={{ aspectRatio: '16/9' }}>
      {/* Main Image with optimized loading */}
      <Image 
        src={normalized[currentIndex]} 
        alt={`${alt} ${currentIndex + 1}`}
        fill 
        priority={priority && currentIndex === 0}
        className="object-cover"
        sizes={sizes}
        quality={75}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          console.warn('Image failed to load:', normalized[currentIndex]);
          // Try to load next image if available
          if (normalized.length > 1) {
            const nextIndex = (currentIndex + 1) % normalized.length;
            setCurrentIndex(nextIndex);
          }
        }}
      />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {/* Navigation Controls */}
      {normalized.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
            aria-label="Previous image"
          >
            ←
          </button>
          
          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition z-10"
            aria-label="Next image"
          >
            →
          </button>
          
          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs z-10">
            {currentIndex + 1} / {normalized.length}
          </div>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
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
