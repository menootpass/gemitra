'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useEvents } from '../hooks/useEvents';
import HeaderNavigation from '../components/HeaderNavigation';
import StickySearchBar from '../components/StickySearchBar';

export default function EventListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [visibleCount, setVisibleCount] = useState(9); // Show 9 events initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { events, loading, error } = useEvents();

  // Memoized filtered and sorted events for performance
  const sortedEvents = useMemo(() => {
    // Filter events based on search term, category, and date range
    const filteredEvents = events.filter(event => {
      const descriptionText = Array.isArray(event.description)
        ? event.description.join(' ')
        : event.description;
      
      // Search filter
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           descriptionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesCategory = selectedCategory === '' || event.category.toLowerCase() === selectedCategory.toLowerCase();
      
      // Date range filter
      let matchesDateRange = true;
      if (selectedDateRange !== '') {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (selectedDateRange) {
          case 'today':
            matchesDateRange = eventDate.toDateString() === today.toDateString();
            break;
          case 'tomorrow':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            matchesDateRange = eventDate.toDateString() === tomorrow.toDateString();
            break;
          case 'this-week':
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + 7);
            matchesDateRange = eventDate >= today && eventDate <= endOfWeek;
            break;
          case 'this-month':
            matchesDateRange = eventDate.getMonth() === today.getMonth() && 
                             eventDate.getFullYear() === today.getFullYear();
            break;
          case 'next-month':
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            matchesDateRange = eventDate.getMonth() === nextMonth.getMonth() && 
                             eventDate.getFullYear() === nextMonth.getFullYear();
            break;
          case 'past':
            matchesDateRange = eventDate < today;
            break;
          case 'upcoming':
            matchesDateRange = eventDate >= today;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesDateRange;
    });

    // Sort events based on selected sort option
    return [...filteredEvents].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      switch (sortBy) {
        case 'newest':
          return dateB.getTime() - dateA.getTime(); // Newest first
        case 'oldest':
          return dateA.getTime() - dateB.getTime(); // Oldest first
        case 'popular':
          return (b.totalPembaca || 0) - (a.totalPembaca || 0); // Most popular first
        case 'alphabetical':
          return a.title.localeCompare(b.title); // A-Z
        case 'location':
          return a.location.localeCompare(b.location); // Location A-Z
        default:
          return dateB.getTime() - dateA.getTime(); // Default: newest first
      }
    });
  }, [events, searchTerm, selectedCategory, selectedDateRange, sortBy]);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return 'Hari Ini';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Besok';
    }
    
    // Check if it's this week
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    if (date >= today && date <= endOfWeek) {
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      });
    }
    
    // Check if it's this month
    if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
      });
    }
    
    // Default format for other dates
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateStatus = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      return { status: 'past', label: 'Event Selesai', color: 'text-gray-400' };
    } else if (date.toDateString() === today.toDateString()) {
      return { status: 'today', label: 'Hari Ini', color: 'text-green-600' };
    } else if (date.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return { status: 'soon', label: 'Minggu Ini', color: 'text-blue-600' };
    } else {
      return { status: 'upcoming', label: 'Mendatang', color: 'text-gray-600' };
    }
  };

  // Infinite scroll handler
  const loadMore = useCallback(() => {
    if (visibleCount < sortedEvents.length && !isLoadingMore) {
      setIsLoadingMore(true);
      // Simulate loading delay for better UX
      setTimeout(() => {
        setVisibleCount(prev => Math.min(prev + 6, sortedEvents.length));
        setIsLoadingMore(false);
      }, 300);
    }
  }, [visibleCount, sortedEvents.length, isLoadingMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < sortedEvents.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [loadMore, visibleCount, sortedEvents.length]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(9);
  }, [searchTerm, selectedCategory, selectedDateRange, sortBy]);

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
      <StickySearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        placeholder="🔍 Cari event berdasarkan judul, deskripsi, atau lokasi..."
        showViewToggle={false}
      />
      
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <input
                  type="text"
                  placeholder="🔍 Cari event berdasarkan judul, deskripsi, atau lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A86E] focus:border-transparent"
                />
              </div>
              
              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A86E] focus:border-transparent"
                >
                  <option value="">📂 Semua Kategori</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Date Range Filter */}
              <div>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#16A86E] focus:border-transparent"
                >
                  <option value="">📅 Semua Waktu</option>
                  <option value="today">Hari Ini</option>
                  <option value="tomorrow">Besok</option>
                  <option value="this-week">Minggu Ini</option>
                  <option value="this-month">Bulan Ini</option>
                  <option value="next-month">Bulan Depan</option>
                  <option value="upcoming">Event Mendatang</option>
                  <option value="past">Event Lampau</option>
                </select>
              </div>
            </div>
            
            {/* Sort Options */}
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                🎯 Urutkan:
              </span>
              {[
                { value: 'newest', label: 'Terbaru', icon: '🆕' },
                { value: 'oldest', label: 'Terlama', icon: '📅' },
                { value: 'popular', label: 'Terpopuler', icon: '🔥' },
                { value: 'alphabetical', label: 'A-Z', icon: '🔤' },
                { value: 'location', label: 'Lokasi', icon: '📍' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    sortBy === option.value
                      ? 'bg-[#16A86E] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
            
            {/* Quick Filter Buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                ⚡ Quick Filter:
              </span>
              {[
                { dateRange: 'today', label: 'Hari Ini', icon: '📅' },
                { dateRange: 'this-week', label: 'Minggu Ini', icon: '📆' },
                { dateRange: 'this-month', label: 'Bulan Ini', icon: '🗓️' },
                { dateRange: 'upcoming', label: 'Event Mendatang', icon: '🚀' }
              ].map(option => (
                <button
                  key={option.dateRange}
                  onClick={() => setSelectedDateRange(selectedDateRange === option.dateRange ? '' : option.dateRange)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDateRange === option.dateRange
                      ? 'bg-[#213DFF] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count and Active Filters */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-gray-600">
                Menampilkan {sortedEvents.length} dari {events.length} event
                {sortBy !== 'newest' && (
                  <span className="ml-2 text-sm text-[#16A86E] font-medium">
                    (Diurutkan berdasarkan {sortBy === 'oldest' ? 'terlama' : 
                     sortBy === 'popular' ? 'terpopuler' : 
                     sortBy === 'alphabetical' ? 'A-Z' : 
                     sortBy === 'location' ? 'lokasi' : 'terbaru'})
                  </span>
                )}
              </p>
              
              {/* Active Filters Display */}
              {(searchTerm || selectedCategory || selectedDateRange) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Filter Aktif:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      🔍 &ldquo;{searchTerm}&rdquo;
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      📂 {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory('')}
                        className="ml-1 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedDateRange && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      📅 {selectedDateRange === 'today' ? 'Hari Ini' :
                          selectedDateRange === 'tomorrow' ? 'Besok' :
                          selectedDateRange === 'this-week' ? 'Minggu Ini' :
                          selectedDateRange === 'this-month' ? 'Bulan Ini' :
                          selectedDateRange === 'next-month' ? 'Bulan Depan' :
                          selectedDateRange === 'upcoming' ? 'Event Mendatang' :
                          selectedDateRange === 'past' ? 'Event Lampau' : selectedDateRange}
                      <button
                        onClick={() => setSelectedDateRange('')}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Events Grid */}
          {sortedEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-600 mb-2">
                Event Tidak Ditemukan
              </h2>
              <p className="text-gray-500 mb-6">
                Coba ubah kata kunci pencarian atau pilih filter yang berbeda
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedDateRange('');
                  setSortBy('newest');
                }}
                className="bg-[#16A86E] text-white font-bold py-2 px-6 rounded-xl hover:bg-[#213DFF] transition"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedEvents.slice(0, visibleCount).map((event) => (
                <Link key={event.id} href={`/event/${event.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Event Image */}
                    <div className="relative w-full h-48">
                      <Image
                        src={getImageSrc(event)}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={false}
                          placeholder='empty'
                          loading="lazy"
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
                            <span className={getDateStatus(event.date).color}>
                              {formatDate(event.date)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getDateStatus(event.date).status === 'today' ? 'bg-green-100 text-green-800' :
                              getDateStatus(event.date).status === 'soon' ? 'bg-blue-100 text-blue-800' :
                              getDateStatus(event.date).status === 'past' ? 'bg-gray-100 text-gray-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {getDateStatus(event.date).label}
                            </span>
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
              
              {/* Infinite Scroll Sentinel */}
              {visibleCount < sortedEvents.length && (
                <div id="scroll-sentinel" className="py-8 text-center">
                  {isLoadingMore ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#16A86E]"></div>
                      <span className="text-gray-600">Memuat event lainnya...</span>
                    </div>
                  ) : (
                    <button
                      onClick={loadMore}
                      className="bg-[#16A86E] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#213DFF] transition-all transform hover:scale-105"
                    >
                      📄 Muat Lebih Banyak Event
                    </button>
                  )}
                </div>
              )}
              
              {/* End of Events */}
              {visibleCount >= sortedEvents.length && sortedEvents.length > 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <p className="text-gray-600 font-medium">
                    Semua event telah ditampilkan!
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Total: {sortedEvents.length} event
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 