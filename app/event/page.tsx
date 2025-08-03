'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useEvents } from '../hooks/useEvents';
import HeaderNavigation from '../components/HeaderNavigation';

export default function EventListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { events, loading, error } = useEvents();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Filter events based on search term and category
  const filteredEvents = events.filter(event => {
    const descriptionText = Array.isArray(event.description)
      ? event.description.join(' ')
      : event.description;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         descriptionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || event.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(events.map(event => event.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <HeaderNavigation />
        
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#213DFF] mb-4">
                Daftar Event
              </h1>
              <p className="text-lg text-gray-600">
                Temukan event menarik di Yogyakarta
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <HeaderNavigation />
        
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Gagal Memuat Data Event
              </h1>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-[#16A86E] text-white font-bold py-2 px-6 rounded-xl hover:bg-[#213DFF] transition"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <HeaderNavigation />
      
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#213DFF] mb-4">
              Daftar Event
            </h1>
            <p className="text-lg text-gray-600">
              Temukan event menarik di Yogyakarta
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Cari event..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A86E] focus:border-transparent"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A86E] focus:border-transparent"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Menampilkan {filteredEvents.length} dari {events.length} event
            </p>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-600 mb-2">
                Event Tidak Ditemukan
              </h2>
              <p className="text-gray-500 mb-6">
                Coba ubah kata kunci pencarian atau pilih kategori yang berbeda
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="bg-[#16A86E] text-white font-bold py-2 px-6 rounded-xl hover:bg-[#213DFF] transition"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link key={event.id} href={`/event/${event.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Event Image */}
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

                    {/* Event Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-[#213DFF] mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {event.description}
                      </p>

                      {/* Event Metadata */}
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>📍</span>
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>👥</span>
                          <span>{event.totalPembaca.toLocaleString()} pembaca</span>
                        </div>
                      </div>

                      {/* Read More Button */}
                      <div className="mt-4">
                        <span className="text-[#16A86E] font-semibold text-sm hover:text-[#213DFF] transition">
                          Baca Selengkapnya →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 