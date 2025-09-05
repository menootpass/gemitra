"use client";
import { useState, useEffect } from "react";

interface StickySearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: string[];
  placeholder: string;
  showViewToggle?: boolean;
  viewMode?: 'list' | 'map';
  onViewModeChange?: (mode: 'list' | 'map') => void;
}

export default function StickySearchBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  placeholder,
  showViewToggle = false,
  viewMode = 'list',
  onViewModeChange
}: StickySearchBarProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // Show sticky bar when scrolled past 100px
      setIsSticky(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide HeaderNavigation when sticky search bar is active
  useEffect(() => {
    const headerNav = document.querySelector('header');
    if (headerNav) {
      if (isSticky) {
        headerNav.style.display = 'none';
      } else {
        headerNav.style.display = 'block';
      }
    }

    // Cleanup: restore header navigation when component unmounts
    return () => {
      const headerNav = document.querySelector('header');
      if (headerNav) {
        headerNav.style.display = 'block';
      }
    };
  }, [isSticky]);

  return (
    <>
      {/* Sticky Search Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-md border-b border-gray-200 shadow-lg transition-all duration-300 ${
          isSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-16 py-3">
          {/* Mobile Layout */}
          <div className="block sm:hidden space-y-3">
            {/* Logo and View Toggle Row */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#213DFF]">Gemitra</span>
              {/* View Toggle (for destinations) - Mobile */}
              {showViewToggle && onViewModeChange && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onViewModeChange('list')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[#16A86E] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => onViewModeChange('map')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'map'
                        ? 'bg-[#16A86E] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Peta
                  </button>
                </div>
              )}
            </div>
            
            {/* Search and Filter - Mobile */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder={placeholder}
                className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-sm"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <span className="text-lg font-bold text-[#213DFF]">Gemitra</span>
            </div>
            
            {/* Search and Filter */}
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder={placeholder}
                className="flex-1 rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-sm"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-sm min-w-[150px]"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* View Toggle (for destinations) - Desktop */}
            {showViewToggle && onViewModeChange && (
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={() => onViewModeChange('list')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[#16A86E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => onViewModeChange('map')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-[#16A86E] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Peta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content jump when sticky bar appears */}
      <div 
        className={`transition-all duration-300 ${
          isSticky ? 'h-16' : 'h-0'
        }`}
      />
    </>
  );
}
