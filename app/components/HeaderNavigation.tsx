'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HeaderNavigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center py-6 px-4 sm:px-6 md:px-16 gap-4 sm:gap-0">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <Link href="/">
            <Image src="/svg/gemitra-text.svg" alt="Gemitra" width={120} height={44} className="block" />
          </Link>
        </div>
                       <nav className="hidden sm:flex gap-6 md:gap-10 text-[#213DFF] font-bold text-base tracking-wide">
                 <Link href="/" className="hover:text-[#16A86E] transition">Beranda</Link>
                 <Link href="/wisata" className="hover:text-[#16A86E] transition">Destinasi</Link>
                 <Link href="/event" className="hover:text-[#16A86E] transition">Event</Link>
               </nav>
      </div>
    </header>
  );
} 