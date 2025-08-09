"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import GemitraMap from "./components/GemitraMap";
import DestinationDetail from "./components/DestinationDetail";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { Destination } from "./types";
import FeedbackForm from "./components/FeedbackForm";

export default function Home() {
  const router = useRouter();
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Polling fetch destinasi
  useEffect(() => {
    let isMounted = true;
    const fetchDestinations = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec";
        const res = await fetch(`${base}?endpoint=destinations`);
        const data = await res.json();
        const parsed = data.data.map((d: any) => ({
          ...d,
          posisi: d.posisi ? (() => {
            try {
              const parsed = JSON.parse(d.posisi);
              // Validate that parsed data is an array with 2 numbers
              if (Array.isArray(parsed) && parsed.length === 2 && 
                  typeof parsed[0] === 'number' && typeof parsed[1] === 'number') {
                return parsed;
              }
              return null;
            } catch {
              console.warn('Invalid position data for destination:', d.nama, d.posisi);
              return null;
            }
          })() : null,
        }));
        if (isMounted) {
          setDestinations(parsed);
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    };
    fetchDestinations();
    const interval = setInterval(fetchDestinations, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  function handleDestinationClick(destination: Destination) {
    setSelectedDestination(destination);
  }

  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col items-center font-sans">
      {/* Header */}
      <header className="w-full max-w-7xl flex flex-col sm:flex-row justify-between items-center py-6 px-4 sm:px-6 md:px-16 rounded-3xl mt-4 mb-2 gap-4 sm:gap-0">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          <Image src="/svg/gemitra-text.svg" alt="Gemitra" width={120} height={44} className="block" />
        </div>
        <nav className="hidden sm:flex gap-6 md:gap-10 text-[#213DFF] font-bold text-base tracking-wide">
              <a href="#about" className="hover:text-[#16A86E] transition">Tentang Kami</a>
              <a href="#services" className="hover:text-[#16A86E] transition">Layanan</a>
              <Link href="/wisata" className="hover:text-[#16A86E] transition">Destinasi</Link>
              <Link href="/event" className="hover:text-[#16A86E] transition">Event</Link>
              <a href="#feedback" className="hover:text-[#16A86E] transition">Feedback</a>
        </nav>
        <div className="flex gap-2">
          <button onClick={() => router.push("/wisata")} className="bg-[#16A86E] text-white font-bold px-6 py-2 rounded-full shadow-lg hover:bg-[#213DFF] hover:glow-blue transition border-2 border-[#16A86E] w-full sm:w-auto">Mulai Jelajah</button>
          
        </div>
      </header>

      {/* Hero Section */}
      <section id="about" className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-10 md:gap-14 mt-4 md:mt-12 px-4 sm:px-6">
        <div className="flex-1 flex flex-col gap-6 md:gap-8 items-center md:items-start w-full">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#213DFF] leading-tight text-center md:text-left">
            Temukan Hidden Gems<br />
            <span className="text-[#16A86E]">Wisata Lokal Bersama Gemitra</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-black/80 max-w-lg text-center md:text-left font-medium">
            Gemitra menghubungkanmu dengan destinasi wisata lokal tersembunyi yang belum banyak dijelajahi. Rasakan pengalaman unik, autentik, dan penuh inspirasi di setiap perjalananmu bersama kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              className="bg-[#16A86E] text-white font-bold px-6 py-2 rounded-full shadow-lg hover:bg-[#213DFF] hover:glow-blue transition text-base sm:text-lg w-full sm:w-auto"
              onClick={() => router.push("/wisata")}
            >
              Jelajahi Sekarang
            </button>
            <button className="bg-white text-[#213DFF] font-bold px-6 py-2 rounded-full shadow-lg border-2 border-[#213DFF] hover:bg-[#213DFF] hover:text-white hover:glow-blue transition text-base sm:text-lg w-full sm:w-auto">Hubungi Kami</button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center relative w-full mt-8 md:mt-0">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-[#213DFF22] bg-glass w-full max-w-xs mx-auto">
            <Image src="/images/brandman-transparant.png" alt="Hero Person" width={320} height={320} className="object-cover w-full h-80" />
          </div>
          <div className="absolute -top-6 -right-6 hidden md:block">
            <Image src="/svg/cursor-click.svg" alt="Decorative Pointer" width={48} height={48} />
          </div>
          <div className="absolute bottom-0 left-0 bg-white/90 rounded-xl px-4 py-2 shadow text-[#16A86E] font-bold text-sm flex items-center gap-2 mt-4">
            <span>★ 5+ Tahun</span> <span className="text-xs font-normal text-black/60">Eksplorasi Lokal</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 mb-4 px-4">
        <div className="bg-glass rounded-2xl p-6 md:p-8 flex flex-col items-center text-[#213DFF] shadow-xl w-full">
          <span className="text-2xl md:text-3xl font-extrabold">100+</span>
          <span className="text-xs md:text-sm mt-2 font-medium text-black/60">Destinasi Tersembunyi</span>
        </div>
        <div className="bg-glass rounded-2xl p-6 md:p-8 flex flex-col items-center text-[#16A86E] shadow-xl w-full">
          <span className="text-2xl md:text-3xl font-extrabold">5+ Tahun</span>
          <span className="text-xs md:text-sm mt-2 font-medium text-black/60">Pengalaman Lokal</span>
        </div>
        <div className="bg-glass rounded-2xl p-6 md:p-8 flex flex-col items-center text-[#213DFF] shadow-xl w-full">
          <span className="text-2xl md:text-3xl font-extrabold">10K+</span>
          <span className="text-xs md:text-sm mt-2 font-medium text-black/60">Traveler Puas</span>
        </div>
        <div className="bg-glass rounded-2xl p-6 md:p-8 flex flex-col items-center text-[#16A86E] shadow-xl w-full">
          <span className="text-2xl md:text-3xl font-extrabold">500+</span>
          <span className="text-xs md:text-sm mt-2 font-medium text-black/60">Cerita Perjalanan</span>
        </div>
      </section>

      {/* Masterpieces Section */}
      <section className="w-full max-w-5xl mt-12 md:mt-16 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#213DFF] mb-6 md:mb-8 text-center md:text-left">Jelajahi Keindahan Tersembunyi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-glass flex items-end min-h-[200px] md:min-h-[240px] w-full">
            <Image src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=400&q=80" alt="Pantai Rahasia" width={400} height={240} className="object-cover w-full h-full absolute inset-0 z-0" />
            <div className="relative z-10 p-4 md:p-6">
              <span className="bg-[#16A86E] text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-base font-bold shadow">Pantai Rahasia di Timur</span>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-glass flex items-end min-h-[200px] md:min-h-[240px] w-full mt-4 md:mt-0">
            <Image src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=400&q=80" alt="Desa Tradisional" width={400} height={240} className="object-cover w-full h-full absolute inset-0 z-0" />
            
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full max-w-5xl mt-14 md:mt-20 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#16A86E] mb-6 md:mb-8 text-center md:text-left">Layanan <span className="text-[#213DFF]">Gemitra</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="bg-glass rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-5 shadow border-l-4 border-[#16A86E] w-full">
              <span className="text-lg md:text-xl font-extrabold text-[#16A86E]">01.</span>
              <span className="text-black font-bold text-base md:text-lg">Paket Wisata Hidden Gems</span>
            </div>
            <div className="bg-glass rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-5 shadow border-l-4 border-[#213DFF] w-full">
              <span className="text-lg md:text-xl font-extrabold text-[#213DFF]">02.</span>
              <span className="text-black font-bold text-base md:text-lg">Custom Trip & Private Tour</span>
            </div>
            <div className="bg-glass rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-5 shadow border-l-4 border-[#16A86E] w-full">
              <span className="text-lg md:text-xl font-extrabold text-[#16A86E]">03.</span>
              <span className="text-black font-bold text-base md:text-lg">Guide Lokal Berpengalaman</span>
            </div>
            <div className="bg-glass rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-5 shadow border-l-4 border-[#213DFF] w-full">
              <span className="text-lg md:text-xl font-extrabold text-[#213DFF]">04.</span>
              <span className="text-black font-bold text-base md:text-lg">Dokumentasi Perjalanan</span>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center mt-6 md:mt-0 w-full">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-[#16A86E22] bg-glass w-full max-w-xs mx-auto">
              <Image src="/images/brandman-transparant.png" alt="Expert" width={320} height={220} className="object-cover w-full h-56" />
            </div>
            <div className="absolute bottom-4 right-4 bg-[#16A86E] text-white px-4 md:px-5 py-2 rounded-full shadow font-bold text-sm md:text-base flex items-center gap-2">
              <span>Konsultasi Trip Gratis!</span>
              <Image src="/svg/cursor-click.svg" alt="Pointer" width={24} height={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full max-w-6xl mt-14 md:mt-20 px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#213DFF] mb-4">Jelajahi Destinasi di Peta</h2>
          <p className="text-black/70 text-base md:text-lg max-w-2xl mx-auto">
            Temukan hidden gems tersembunyi di Yogyakarta. Klik pin di peta untuk melihat detail destinasi wisata yang menarik.
          </p>
        </div>
        
        
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <LoadingSkeleton type="map" />
          ) : (
            <GemitraMap
              destinations={destinations}
              onDestinationClick={handleDestinationClick}
              selectedDestination={selectedDestination}
            />
          )}
          <DestinationDetail
            destination={selectedDestination}
            onClose={() => setSelectedDestination(null)}
          />
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/wisata")}
            className="bg-[#16A86E] text-white font-bold px-8 py-3 rounded-full shadow-lg hover:bg-[#213DFF] hover:glow-blue transition text-base md:text-lg"
          >
            Lihat Semua Destinasi
          </button>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section id="feedback" className="w-full max-w-5xl mt-14 md:mt-20 px-4 sm:px-6">
        
        <FeedbackForm />
      </section>

      {/* Footer Slogan */}
      <footer className="w-full mt-14 md:mt-20 py-8 md:py-10 bg-white bg-gradient-indie flex flex-col items-center rounded-t-3xl shadow-xl px-4">
        <div className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#213DFF] flex flex-wrap gap-2 sm:gap-6 items-center tracking-tight justify-center">
          <span>Jelajah</span>
          <span className="text-[#16A86E]">+</span>
          <span>Temukan</span>
          <span className="text-[#213DFF]">+</span>
          <span className="text-black">Cerita Baru</span>
        </div>
      </footer>
    </div>
  );
}