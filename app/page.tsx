"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import GemitraMap from "./components/GemitraMap";
import DestinationDetail from "./components/DestinationDetail";
import LoadingSkeleton from "./components/LoadingSkeleton";
import { Destination } from "./types";
import FeedbackForm from "./components/FeedbackForm";
import Link from "next/link";

export default function Home() {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Hydration effect
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Polling fetch destinasi
  useEffect(() => {
    let isMounted = true;
    const fetchDestinations = async () => {
      try {
        const res = await fetch("https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec");
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
    const interval = setInterval(fetchDestinations, 30000); // Refresh every 30 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  function handleDestinationClick(destination: Destination) {
    setSelectedDestination(destination);
  }

  if (!hydrated || loading) return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      <LoadingSkeleton type="list" count={6} />
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto mt-8 mb-6 flex-1">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/svg/gemitra-logo.svg"
              alt="Gemitra Logo"
              width={120}
              height={120}
              className="w-24 h-24 sm:w-32 sm:h-32"
            />
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#213DFF] mb-4">
            Selamat Datang di
            <span className="block text-[#16A86E]">Gemitra</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Temukan destinasi wisata terbaik di Yogyakarta dan sekitarnya dengan layanan transportasi yang nyaman dan terpercaya.
          </p>
          
          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/wisata/"
              className="bg-[#16A86E] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#213DFF] transition transform hover:scale-105"
            >
              Jelajahi Destinasi
            </Link>
            <Link
              href="/event/"
              className="bg-[#213DFF] text-white font-bold px-8 py-3 rounded-xl hover:bg-[#16A86E] transition transform hover:scale-105"
            >
              Lihat Event
            </Link>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF] mb-6 text-center">
            Peta Destinasi Wisata
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GemitraMap
                destinations={destinations}
                onDestinationClick={handleDestinationClick}
              />
            </div>
            <div className="lg:col-span-1">
              <DestinationDetail
                destination={selectedDestination}
                onClose={() => setSelectedDestination(null)}
              />
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF] mb-6 text-center">
            Berikan Feedback
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <FeedbackForm />
            </div>
            <div className="space-y-4">
              <div className="bg-glass rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-[#16A86E] mb-2">📞 Hubungi Kami</h3>
                <p className="text-gray-600 mb-2">Telepon: +62 896-0688-3082</p>
                <p className="text-gray-600 mb-2">Email: info@gemitra.com</p>
                <p className="text-gray-600">Jam Kerja: 08:00 - 17:00 WIB</p>
              </div>
              <div className="bg-glass rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-[#16A86E] mb-2">📍 Lokasi</h3>
                <p className="text-gray-600">Jl. Malioboro No. 123</p>
                <p className="text-gray-600">Yogyakarta, Indonesia</p>
              </div>
              <div className="bg-glass rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-[#16A86E] mb-2">💬 Layanan Pelanggan</h3>
                <p className="text-gray-600 mb-2">WhatsApp: +62 896-0688-3082</p>
                <p className="text-gray-600">Respon cepat dalam 24 jam</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
