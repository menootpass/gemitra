"use client";
import { useState, useEffect } from "react";
import { useEvents } from "../hooks/useEvents";
import Link from "next/link";
import Image from "next/image";
import { handleImageError } from "../utils/imageUtils";

export default function EventsSlider() {
  const { events, loading, error } = useEvents();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Limit to only show latest 6 events to reduce API load and improve performance
  // This prevents loading too many events on the homepage slider
  const limitedEvents = events.slice(0, 6);
  
  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cardsPerView = isMobile ? 1 : 3; // 1 card on mobile, 3 on desktop
  const maxIndex = Math.max(0, limitedEvents.length - cardsPerView);

  // Auto-advance slider
  useEffect(() => {
    if (limitedEvents.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const currentMaxIndex = Math.max(0, limitedEvents.length - cardsPerView);
        return prevIndex >= currentMaxIndex ? 0 : prevIndex + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [limitedEvents.length, cardsPerView]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // Enhanced image handling with better fallbacks
  const getImageSrc = (event: any): string => {
    // Handle string that contains array (e.g., "["https://..."]")
    if (typeof event.image === 'string' && event.image.trim() !== '') {
      const trimmed = event.image.trim();
      
      // Check if it's a stringified array
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const firstUrl = parsed[0];
            if (typeof firstUrl === 'string' && (firstUrl.startsWith('http://') || firstUrl.startsWith('https://'))) {
              return firstUrl;
            }
          }
        } catch {
          // If JSON parsing fails, try to extract URL manually
          const urlMatch = trimmed.match(/https?:\/\/[^\s,\]]+/);
          if (urlMatch) {
            return urlMatch[0];
          }
        }
      }
      
      // If it's a direct URL string
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
      }
    }
    
    // Handle actual array
    if (Array.isArray(event.image) && event.image.length > 0) {
      const firstItem = event.image[0];
      if (typeof firstItem === 'string') {
        // Handle nested stringified arrays in array
        if (firstItem.startsWith('[') && firstItem.endsWith(']')) {
          try {
            const parsed = JSON.parse(firstItem);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const url = parsed[0];
              if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
                return url;
              }
            }
          } catch {
            // Try manual extraction
            const urlMatch = firstItem.match(/https?:\/\/[^\s,\]]+/);
            if (urlMatch) {
              return urlMatch[0];
            }
          }
        }
        // Direct URL in array
        if (firstItem.startsWith('http://') || firstItem.startsWith('https://')) {
          return firstItem;
        }
      }
    }
    
    // Return a placeholder image
    return 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80';
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/event">
            <h2 className="text-xl sm:text-2xl font-bold text-[#213DFF] underline">Event Terbaru</h2>
          </Link>
        </div>
        <div className="flex justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl w-72 sm:w-80 h-40 sm:h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || limitedEvents.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/event">
            <h2 className="text-xl sm:text-2xl font-bold text-[#213DFF] underline">Event Terbaru</h2>
          </Link>
        </div>
        <div className="text-center text-gray-500">
          {error || "Tidak ada event tersedia saat ini"}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/event">
          <h2 className="text-xl sm:text-2xl font-bold text-[#213DFF] underline">Event Terbaru</h2>
        </Link>
      </div>
      
      <div className="relative overflow-hidden">
        {/* Navigation Buttons - Left */}
        <button 
          onClick={prevSlide} 
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 text-[#213DFF] p-2 sm:p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200"
        >
          ‹
        </button>
        
        {/* Navigation Buttons - Right */}
        <button 
          onClick={nextSlide} 
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 text-[#213DFF] p-2 sm:p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200"
        >
          ›
        </button>
        
        {/* Cards Container with Horizontal Scroll */}
        <div 
          className="flex gap-4 sm:gap-6 transition-transform duration-500 ease-in-out px-12 sm:px-16"
          style={{
            transform: `translateX(-${currentIndex * (isMobile ? 288 + 16 : 320 + 24)}px)`, // Responsive card width + gap
            width: `${limitedEvents.length * (isMobile ? 288 + 16 : 320 + 24) - (isMobile ? 16 : 24)}px` // Total width minus last gap
          }}
        >
            {limitedEvents.map((event, index) => (
              <div 
                key={event.id} 
              className={`flex-shrink-0 ${isMobile ? 'w-72' : 'w-80'}`}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className={`relative ${isMobile ? 'h-32' : 'h-40'} overflow-hidden`}>
                  <Image
                      src={getImageSrc(event)}
                      alt={event.title}
                    width={isMobile ? 288 : 320}
                    height={isMobile ? 128 : 160}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      handleImageError(e as React.SyntheticEvent<HTMLImageElement>);
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="bg-[#16A86E] text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg">
                      {event.category || 'Event'}
                      </span>
                    </div>
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                    <div className="bg-white/90 backdrop-blur-sm text-[#213DFF] text-xs font-bold px-2 py-1 rounded-full">
                      {new Date(event.date).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                    </div>
                  </div>
                  
                <div className="p-3 sm:p-5">
                  <h3 className="font-bold text-[#213DFF] text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#16A86E] transition-colors duration-300">
                      {event.title}
                    </h3>
                    
                  <div className="flex items-center gap-2 sm:gap-4 text-xs text-gray-600 mb-2 sm:mb-3">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        <span>📅</span>
                      <span className="hidden sm:inline">{new Date(event.date).toLocaleDateString('id-ID')}</span>
                      <span className="sm:hidden">{new Date(event.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                        <span>👥</span>
                      <span className="hidden sm:inline">{event.totalPembaca || 0} pembaca</span>
                      <span className="sm:hidden">{event.totalPembaca || 0}</span>
                      </div>
                    </div>
                    
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 mb-3 sm:mb-4 leading-relaxed">
                      {event.description}
                    </p>
                    
                    <Link href={`/event/${event.slug || event.id}`}>
                    <button className="w-full bg-gradient-to-r from-[#16A86E] to-[#213DFF] text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-full text-center hover:from-[#213DFF] hover:to-[#16A86E] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Detail Event
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {/* Enhanced Dots Indicator */}
        <div className="flex justify-center mt-4 sm:mt-6 gap-2 sm:gap-3">
          {Array.from({ length: Math.ceil(limitedEvents.length / cardsPerView) }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index * cardsPerView)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / cardsPerView) === index
                  ? 'bg-gradient-to-r from-[#16A86E] to-[#213DFF] scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 