"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { normalizeImageUrls } from "../utils/imageUtils";

interface LazyImageProps {
  src: string | string[];
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}

export default function LazyImage({ 
  src, 
  alt, 
  className = "", 
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 75,
  loading,
  fetchPriority
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Normalize image source
  const normalizedSrc = Array.isArray(src) ? src[0] : src;
  const normalizedImages = normalizeImageUrls(Array.isArray(src) ? src : [src]);

  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  if (!normalizedImages || normalizedImages.length === 0) {
    return (
      <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-2">🏞️</div>
          <div className="text-sm">No Image</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative w-full h-full ${className}`}>
      {isInView ? (
        <Image
          src={normalizedImages[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          quality={quality}
          priority={priority}
          loading={loading || (priority ? "eager" : "lazy")}
          fetchPriority={fetchPriority || (priority ? "high" : "auto")}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          onLoad={() => setIsLoaded(true)}
          onError={(e) => {
            console.warn('Image failed to load:', normalizedImages[0]);
            // Try next image if available
            if (normalizedImages.length > 1) {
              // This would need to be handled by parent component
              // For now, just log the error
            }
          }}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
}
