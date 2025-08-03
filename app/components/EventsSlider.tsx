"use client";
import { useState, useEffect } from "react";
import { useEvents } from "../hooks/useEvents";
import Link from "next/link";

export default function EventsSlider() {
  const { events, loading, error } = useEvents();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    if (events.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#213DFF]">Event Terbaru</h2>
        </div>
        <div className="flex justify-center">
          <div className="animate-pulse bg-gray-200 rounded-xl w-80 h-48"></div>
        </div>
      </div>
    );
  }

  if (error || events.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#213DFF]">Event Terbaru</h2>
        </div>
        <div className="text-center text-gray-500">
          {error || "Tidak ada event tersedia saat ini"}
        </div>
      </div>
    );
  }

  // Ensure image is a string
  const getImageSrc = (event: any): string => {
    if (typeof event.image === 'string') {
      return event.image;
    }
    if (Array.isArray(event.image) && event.image.length > 0) {
      return event.image[0];
    }
    return '/images/event-placeholder.jpg';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#213DFF]">Event Terbaru</h2>
      </div>
      <div className="relative">
        {/* Navigation Buttons */}
        <button 
          onClick={prevSlide} 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 text-[#213DFF] p-2 rounded-full shadow-lg hover:bg-white transition"
        >
          ‹
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 text-[#213DFF] p-2 rounded-full shadow-lg hover:bg-white transition"
        >
          ›
        </button>
        
        {/* Cards Container */}
        <div className="flex justify-center px-16">
          <div className="flex gap-4 overflow-hidden max-w-6xl">
            {events.map((event, index) => (
              <div 
                key={event.id} 
                className={`flex-shrink-0 w-80 transition-all duration-300 ${
                  index === currentIndex ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
                }`}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="relative h-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageSrc(event)}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#16A86E] text-white text-xs font-bold px-2 py-1 rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-[#213DFF] text-sm mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{new Date(event.date).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{event.totalPembaca || 0} pembaca</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                      {event.description}
                    </p>
                    
                    <Link href={`/event/${event.slug || event.id}`}>
                      <button className="w-full mt-4 bg-[#16A86E] text-white text-xs font-bold px-3 py-1 rounded-full text-center hover:bg-[#213DFF] transition">
                        Detail Event
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Dots Indicator */}
        <div className="flex justify-center mt-4 gap-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex ? 'bg-[#16A86E]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 