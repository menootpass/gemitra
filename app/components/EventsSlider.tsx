"use client";
import { useState } from "react";
import { CaretLeft, CaretRight } from "phosphor-react";
import Image from "next/image";
import Link from "next/link";
import { Event } from "../types";
import { useEvents } from "../hooks/useEvents";

// Sample event data - you can replace this with real data from your API
const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Festival Budaya Yogyakarta",
    description: "Menampilkan berbagai kesenian tradisional dan modern dari seluruh Indonesia",
    image: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop"],
    date: "2024-12-15",
    location: "Alun-Alun Utara Yogyakarta",
    category: "Budaya",
    totalPembaca: 1250,
    content: "Festival Budaya Yogyakarta akan menghadirkan berbagai pertunjukan tradisional...",
    author: "Tim Gemitra",
    slug: "festival-budaya-yogyakarta"
  },
  {
    id: "2",
    title: "Jazz Night at Malioboro",
    description: "Malam jazz dengan musisi lokal dan internasional di jantung Malioboro",
    image: ["https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"],
    date: "2024-12-20",
    location: "Malioboro Street",
    category: "Musik",
    totalPembaca: 890,
    content: "Jazz Night at Malioboro akan menghadirkan musisi lokal dan internasional...",
    author: "Tim Gemitra",
    slug: "jazz-night-at-malioboro"
  },
  {
    id: "3",
    title: "Culinary Festival",
    description: "Festival kuliner terbesar di Yogyakarta dengan ratusan vendor makanan",
    image: ["https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop"],
    date: "2024-12-25",
    location: "Taman Pintar Yogyakarta",
    category: "Kuliner",
    totalPembaca: 2100,
    content: "Culinary Festival akan menghadirkan ratusan vendor makanan terbaik...",
    author: "Tim Gemitra",
    slug: "culinary-festival"
  },
  {
    id: "4",
    title: "Art Exhibition: Modern Indonesia",
    description: "Pameran seni kontemporer Indonesia dengan karya-karya terbaik",
    image: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"],
    date: "2024-12-10",
    location: "Galeri Seni Yogyakarta",
    category: "Seni",
    totalPembaca: 750,
    content: "Art Exhibition akan menampilkan karya-karya seni kontemporer terbaik...",
    author: "Tim Gemitra",
    slug: "art-exhibition-modern-indonesia"
  },
  {
    id: "5",
    title: "Tech Conference 2024",
    description: "Konferensi teknologi terbesar di Yogyakarta dengan pembicara internasional",
    image: ["https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop"],
    date: "2024-12-28",
    location: "Hotel Grand Palace",
    category: "Teknologi",
    totalPembaca: 1800,
    content: "Tech Conference 2024 akan menghadirkan pembicara internasional...",
    author: "Tim Gemitra",
    slug: "tech-conference-2024"
  },
  {
    id: "6",
    title: "Traditional Dance Performance",
    description: "Pertunjukan tari tradisional Jawa dengan kostum dan musik asli",
    image: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"],
    date: "2024-12-22",
    location: "Keraton Yogyakarta",
    category: "Tradisional",
    totalPembaca: 650,
    content: "Traditional Dance Performance akan menampilkan tari tradisional Jawa...",
    author: "Tim Gemitra",
    slug: "traditional-dance-performance"
  }
];

export default function EventsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use real data from API
  const { events, loading, error } = useEvents();
  const displayEvents = events.length > 0 ? events : sampleEvents;

  const nextSlide = () => {
    if (currentIndex < displayEvents.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const visibleEvents = displayEvents.slice(currentIndex, currentIndex + 3);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full mb-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF]">
            Event Terbaru
          </h2>
        </div>
        <div className="flex justify-center">
          <div className="animate-pulse">
            <div className="h-48 w-80 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full mb-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF]">
            Event Terbaru
          </h2>
        </div>
        <div className="text-center text-red-500">
          <p>Gagal memuat data events: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-12">
             <div className="text-center mb-6">
         <h2 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF]">
           Event Terbaru
         </h2>
       </div>

      <div className="relative">
        {/* Left Navigation Button */}
        <button
          onClick={prevSlide}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-white border border-[#16A86E] text-[#16A86E] hover:bg-[#16A86E] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <CaretLeft size={24} />
        </button>

        {/* Right Navigation Button */}
        <button
          onClick={nextSlide}
          disabled={currentIndex >= displayEvents.length - 3}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full bg-white border border-[#16A86E] text-[#16A86E] hover:bg-[#16A86E] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <CaretRight size={24} />
        </button>

        {/* Centered Cards Container */}
        <div className="flex justify-center">
          <div className="flex gap-6 overflow-hidden max-w-6xl">
            {visibleEvents.map((event) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-full sm:w-80 rounded-2xl overflow-hidden shadow-xl bg-glass hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={event.image && event.image.length > 0 ? event.image[0] : "/images/event-placeholder.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#16A86E] text-white text-xs font-bold px-2 py-1 rounded-full">
                      {event.category}
                    </span>
                  </div>
                </div>
                                 <div className="p-6">
                   <h3 className="text-lg font-bold text-[#213DFF] mb-2 line-clamp-2">
                     {event.title}
                   </h3>
                   <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                     {event.description}
                   </p>
                   <div className="flex flex-col gap-2 text-xs text-gray-500">
                     <div className="flex items-center gap-1">
                       <span>📅</span>
                       <span className="truncate">{event.date}</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <span>📍</span>
                       <span className="truncate">{event.location}</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <span>👥</span>
                       <span>{event.totalPembaca.toLocaleString()}</span>
                     </div>
                   </div>
                  <Link href={`/event/${event.slug}`}>
                    <button className="w-full mt-4 bg-[#16A86E] text-white font-bold py-2 px-4 rounded-xl hover:bg-[#213DFF] transition">
                      Detail Event
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: Math.ceil(displayEvents.length / 3) }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i * 3)}
            className={`w-2 h-2 rounded-full transition ${
              i === Math.floor(currentIndex / 3)
                ? "bg-[#16A86E]"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
} 