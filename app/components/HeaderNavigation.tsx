'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function HeaderNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-6 px-4 sm:px-6 md:px-16">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image src="/svg/gemitra-text.svg" alt="Gemitra" width={120} height={44} className="block" />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex gap-6 md:gap-10 text-[#213DFF] font-bold text-base tracking-wide">
          <Link href="/" className="hover:text-[#16A86E] transition">Beranda</Link>
          <Link href="/wisata" className="hover:text-[#16A86E] transition">Destinasi</Link>
          <Link href="/event" className="hover:text-[#16A86E] transition">Event</Link>
        </nav>

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
            Beranda
          </Link>
          <Link 
            href="/wisata" 
            className="px-6 py-3 text-[#213DFF] font-bold text-base hover:bg-gray-50 hover:text-[#16A86E] transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Destinasi
          </Link>
          <Link 
            href="/event" 
            className="px-6 py-3 text-[#213DFF] font-bold text-base hover:bg-gray-50 hover:text-[#16A86E] transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Event
          </Link>
        </nav>
      </div>
    </header>
  );
} 