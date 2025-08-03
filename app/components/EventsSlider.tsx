"use client";
import { useState, useEffect } from "react";
import { useEvents } from "../hooks/useEvents";
import Link from "next/link";
import Image from "next/image";

export default function EventsSlider() {
  const { events, loading, error } = useEvents();
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3; // Number of cards visible at once
  const maxIndex = Math.max(0, events.length - cardsPerView);

  // Auto-advance slider
  useEffect(() => {
    if (events.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const currentMaxIndex = Math.max(0, events.length - cardsPerView);
        return prevIndex >= currentMaxIndex ? 0 : prevIndex + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

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
    if (typeof event.image === 'string' && event.image.trim() !== '') {
      return event.image;
    }
    if (Array.isArray(event.image) && event.image.length > 0 && event.image[0]) {
      return event.image[0];
    }
    // Return a placeholder image
    return 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80';
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#213DFF]">Event Terbaru</h2>
        </div>
        <div className="flex justify-center gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-xl w-80 h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#213DFF]">Event Terbaru</h2>
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
        <h2 className="text-2xl font-bold text-[#213DFF]">Event Terbaru</h2>
      </div>
      
      <div className="relative overflow-hidden">
        {/* Navigation Buttons - Left */}
        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 text-[#213DFF] p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200"
        >
          ‹
        </button>
        
        {/* Navigation Buttons - Right */}
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 text-[#213DFF] p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200"
        >
          ›
        </button>
        
        {/* Cards Container with Horizontal Scroll */}
        <div 
          className="flex gap-6 transition-transform duration-500 ease-in-out px-16"
          style={{
            transform: `translateX(-${currentIndex * (320 + 24)}px)`, // 320px card width + 24px gap
            width: `${events.length * (320 + 24) - 24}px` // Total width minus last gap
          }}
        >
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className="flex-shrink-0 w-80"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={getImageSrc(event)}
                    alt={event.title}
                    width={320}
                    height={160}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#16A86E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {event.category || 'Event'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm text-[#213DFF] text-xs font-bold px-2 py-1 rounded-full">
                      {new Date(event.date).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-[#213DFF] text-base mb-3 line-clamp-2 group-hover:text-[#16A86E] transition-colors duration-300">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                      <span>📅</span>
                      <span>{new Date(event.date).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                      <span>👥</span>
                      <span>{event.totalPembaca || 0} pembaca</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {event.description}
                  </p>
                  
                  <Link href={`/event/${event.slug || event.id}`}>
                    <button className="w-full bg-gradient-to-r from-[#16A86E] to-[#213DFF] text-white text-sm font-bold px-4 py-2 rounded-full text-center hover:from-[#213DFF] hover:to-[#16A86E] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      Detail Event
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced Dots Indicator */}
        <div className="flex justify-center mt-6 gap-3">
          {Array.from({ length: Math.ceil(events.length / cardsPerView) }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index * cardsPerView)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
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