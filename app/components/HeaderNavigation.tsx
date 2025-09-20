'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';

export default function HeaderNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { locale, dictionary, setLocale } = useLanguage();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const handleLanguageChange = (newLocale: 'id' | 'en') => {
    setLocale(newLocale);
    setIsLanguageOpen(false);
  };

  return (
    
    <header className="fixed top-0 left-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 right-0 z-40 w-full bg-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6 md:px-16">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image src="/svg/gemitra-text.svg" alt="Gemitra" width={80} height={20} style={{ width: "200px", height: "80px" }} />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-6 md:gap-10">
          <nav className="flex gap-6 md:gap-10 text-[#213DFF] font-bold text-base tracking-wide">
            <Link href="/" className="hover:text-[#16A86E] transition">{dictionary.navigation.home}</Link>
            <Link href="/wisata" className="hover:text-[#16A86E] transition">{dictionary.navigation.destinations}</Link>
            <Link href="/event" className="hover:text-[#16A86E] transition">{dictionary.navigation.events}</Link>
          </nav>
          
          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-[#213DFF] hover:text-[#16A86E] transition font-medium"
            >
              <Globe size={18} />
              <span className="uppercase text-sm font-bold">{locale}</span>
              <ChevronDown size={16} className={`transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLanguageOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg border border-gray-200 py-2 min-w-[120px] z-50">
                <button
                  onClick={() => handleLanguageChange('id')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                    locale === 'id' ? 'text-[#16A86E] font-bold' : 'text-gray-700'
                  }`}
                >
                  🇮🇩 Bahasa
                </button>
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition ${
                    locale === 'en' ? 'text-[#16A86E] font-bold' : 'text-gray-700'
                  }`}
                >
                  🇺🇸 English
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          onClick={toggleMenu}
          className="sm:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
        >
          <span className={`block w-6 h-0.5 bg-[#213DFF] transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[#213DFF] transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-[#213DFF] transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div className={`sm:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <nav className="flex flex-col py-4">
          <Link 
            href="/" 
            className="px-6 py-3 text-[#213DFF] font-bold text-base hover:bg-gray-50 hover:text-[#16A86E] transition"
            onClick={() => setIsMenuOpen(false)}
          >
            {dictionary.navigation.home}
          </Link>
          <Link 
            href="/wisata" 
            className="px-6 py-3 text-[#213DFF] font-bold text-base hover:bg-gray-50 hover:text-[#16A86E] transition"
            onClick={() => setIsMenuOpen(false)}
          >
            {dictionary.navigation.destinations}
          </Link>
          <Link 
            href="/event" 
            className="px-6 py-3 text-[#213DFF] font-bold text-base hover:bg-gray-50 hover:text-[#16A86E] transition"
            onClick={() => setIsMenuOpen(false)}
          >
            {dictionary.navigation.events}
          </Link>
          
          {/* Mobile Language Selector */}
          <div className="px-6 py-3 border-t border-gray-100 mt-2">
            <div className="flex items-center gap-2 mb-2 text-gray-600 text-sm">
              <Globe size={16} />
              <span>Language</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('id')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
                  locale === 'id' ? 'bg-[#16A86E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇮🇩 Bahasa
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition ${
                  locale === 'en' ? 'bg-[#16A86E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
} 