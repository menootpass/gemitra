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
import HeaderNavigation from "./components/HeaderNavigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Star, MessageCircle, ArrowRight, Camera, Compass } from "lucide-react";
import { useLanguage } from "./contexts/LanguageContext";
import { useRobustDestinations } from "./hooks/useRobustDestinations";

export default function Home() {
  const router = useRouter();
  const { dictionary } = useLanguage();
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  
  // Use robust destinations hook dengan polling
  const { 
    destinations, 
    loading, 
    error, 
    refresh,
    isOnline,
    retryCount 
  } = useRobustDestinations({
    enablePolling: true,
    pollingInterval: 10000, // 10 seconds untuk homepage
    enableRetry: true
  });

  function handleDestinationClick(destination: Destination) {
    setSelectedDestination(destination);
  }

  const whatsappMessage = dictionary.whatsapp.message;

      // Encode message for WhatsApp URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/6285701834668?text=${encodedMessage}`;

      const handleWhatsapp = () => {
        window.open(whatsappUrl, '_blank');
      }

  return (
    
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col items-center font-sans">
    {/* Header */}
    <HeaderNavigation />

      {/* Hero Section */}
      <section id="about" className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-10 md:gap-14 mt-20 md:mt-28 px-4 sm:px-6">
        <div className="flex-1 flex flex-col gap-6 md:gap-8 items-center md:items-start w-full">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#213DFF] leading-tight text-center md:text-left">
            {dictionary.hero.title.split('\n').map((line, index) => (
              <span key={index}>
                {index === 0 ? line : <span className="text-[#16A86E]">{line}</span>}
                {index === 0 && <br />}
              </span>
            ))}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-black/80 max-w-lg text-center md:text-left font-medium">
            {dictionary.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto justify-center sm:justify-start">
            <button
              className="bg-[#16A86E] text-white font-bold px-6 py-2 rounded-full shadow-lg hover:bg-[#213DFF] hover:glow-blue transition text-base sm:text-lg w-full sm:w-auto"
              onClick={() => router.push("/wisata")}
            >
              {dictionary.hero.exploreNow}
            </button>
            <button onClick={handleWhatsapp} className="bg-white text-[#213DFF] font-bold px-6 py-2 rounded-full shadow-lg border-2 border-[#213DFF] hover:bg-[#213DFF] hover:text-white hover:glow-blue transition text-base sm:text-lg w-full sm:w-auto">{dictionary.hero.contactUs}</button>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center relative w-full mt-8 md:mt-0">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-[#213DFF22] bg-glass w-full max-w-xs mx-auto">
            <Image src="/images/brandman-transparant.png" alt="Hero Person" width={320} height={320} className="object-cover w-full h-80" style={{ width: "auto", height: "auto" }} />
          </div>
          <div className="absolute -top-6 -right-6 hidden md:block">
            <Image src="/svg/cursor-click.svg" alt="Decorative Pointer" width={48} height={48} style={{ width: "auto", height: "auto" }} />
          </div>
          <div className="absolute bottom-0 left-0 bg-white/90 rounded-xl px-4 py-2 shadow text-[#16A86E] font-bold text-sm flex items-center gap-2 mt-4">
            <span>{dictionary.hero.yearsExperience}</span> <span className="text-xs font-normal text-black/60">{dictionary.hero.localExploration}</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 mb-4 px-4">
        <div className="bg-glass rounded-2xl p-6 md:p-8 flex flex-col items-center text-[#213DFF] shadow-xl w-full">
          <span className="text-2xl md:text-3xl font-extrabold">100+</span>
          <span className="text-xs md:text-sm mt-2 font-medium text-black/60">{dictionary.stats.hiddenDestinations}</span>
        </div>
        <div className="bg-glass rounded-2xl p-6 md:p-8 flex flex-col items-center text-[#16A86E] shadow-xl w-full">
          <span className="text-2xl md:text-3xl font-extrabold">5+ Years</span>
          <span className="text-xs md:text-sm mt-2 font-medium text-black/60">{dictionary.stats.localExperience}</span>
        </div>
        <div className="bg-glass rounded-2xl p-6 md:p-8 flex flex-col items-center text-[#213DFF] shadow-xl w-full">
          <span className="text-2xl md:text-3xl font-extrabold">10K+</span>
          <span className="text-xs md:text-sm mt-2 font-medium text-black/60">{dictionary.stats.satisfiedTravelers}</span>
        </div>
        <div className="bg-glass rounded-2xl p-6 md:p-8 flex flex-col items-center text-[#16A86E] shadow-xl w-full">
          <span className="text-2xl md:text-3xl font-extrabold">500+</span>
          <span className="text-xs md:text-sm mt-2 font-medium text-black/60">{dictionary.stats.travelStories}</span>
        </div>
      </section>

      {/* Masterpieces Section */}
      <section className="w-full max-w-5xl mt-12 md:mt-16 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#213DFF] mb-6 md:mb-8 text-center md:text-left">{dictionary.sections.exploreHiddenBeauty}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-glass flex items-end min-h-[200px] md:min-h-[240px] w-full">
            <Image src="/images/klangon.jpg" alt="Secret Beach" width={400} height={240} className="object-cover w-full h-full absolute inset-0 z-0" style={{ width: "auto", height: "auto" }} />
            <div className="relative z-10 p-4 md:p-6">
              <span className="bg-[#16A86E] text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-base font-bold shadow">{dictionary.sections.secretHillNorth}</span>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-glass flex items-end min-h-[200px] md:min-h-[240px] w-full mt-4 md:mt-0">
            <Image src="/images/kemah.jpg" alt="Desa Tradisional" width={400} height={240} className="object-cover w-full h-full absolute inset-0 z-0" style={{ width: "auto", height: "auto" }} />
            
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="w-full max-w-5xl mt-14 md:mt-20 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#16A86E] mb-6 md:mb-8 text-center md:text-left">
          {dictionary.sections.gemitraServices.split(' ').map((word, index) => (
            <span key={index}>
              {index === 1 ? (
                <span className="text-[#213DFF]">{word}</span>
              ) : (
                word
              )}
              {index < dictionary.sections.gemitraServices.split(' ').length - 1 && ' '}
            </span>
          ))}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="bg-glass rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-5 shadow border-l-4 border-[#16A86E] w-full">
              <span className="text-lg md:text-xl font-extrabold text-[#16A86E]">01.</span>
              <span className="text-black font-bold text-base md:text-lg">{dictionary.services.hiddenGemPackages}</span>
            </div>
            <div className="bg-glass rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-5 shadow border-l-4 border-[#213DFF] w-full">
              <span className="text-lg md:text-xl font-extrabold text-[#213DFF]">02.</span>
              <span className="text-black font-bold text-base md:text-lg">{dictionary.services.customTrip}</span>
            </div>
            <div className="bg-glass rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-5 shadow border-l-4 border-[#16A86E] w-full">
              <span className="text-lg md:text-xl font-extrabold text-[#16A86E]">03.</span>
              <span className="text-black font-bold text-base md:text-lg">{dictionary.services.experiencedGuides}</span>
            </div>
            <div className="bg-glass rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-5 shadow border-l-4 border-[#213DFF] w-full">
              <span className="text-lg md:text-xl font-extrabold text-[#213DFF]">04.</span>
              <span className="text-black font-bold text-base md:text-lg">{dictionary.services.travelDocumentation}</span>
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center mt-6 md:mt-0 w-full">
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-[#16A86E22] bg-glass w-full max-w-xs mx-auto">
              <Image src="/images/brandman-transparant.png" alt="Expert" width={320} height={220} className="object-cover w-full h-56" style={{ width: "auto", height: "auto" }} />
            </div>
            <div className="absolute bottom-4 right-4 bg-[#16A86E] text-white px-4 md:px-5 py-2 rounded-full shadow font-bold text-sm md:text-base flex items-center gap-2">
              <span>{dictionary.sections.freeConsultation}</span>
              <Image src="/svg/cursor-click.svg" alt="Pointer" width={24} height={24} style={{ width: "auto", height: "auto" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="w-full max-w-6xl mt-14 md:mt-20 px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#213DFF] mb-4">{dictionary.sections.exploreOnMap}</h2>
          <p className="text-black/70 text-base md:text-lg max-w-2xl mx-auto">
            {dictionary.sections.mapDescription}
          </p>
        </div>
        
        
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            <LoadingSkeleton type="map" />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-red-500 mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-red-800 font-semibold mb-2">Failed to Load Map Data</h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {loading ? 'Retrying...' : 'Try Again'}
                </button>
                {!isOnline && (
                  <span className="text-red-500 text-sm self-center">
                    📶 Check your internet connection
                  </span>
                )}
              </div>
              {retryCount > 0 && (
                <p className="text-red-500 text-xs mt-2">
                  Retry attempt: {retryCount}/3
                </p>
              )}
            </div>
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
            {dictionary.sections.viewAllDestinations}
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
          <span>{dictionary.footer.explore}</span>
          <span className="text-[#16A86E]">+</span>
          <span>{dictionary.footer.discover}</span>
          <span className="text-[#213DFF]">+</span>
          <span className="text-black">{dictionary.footer.newStories}</span>
        </div>
      </footer>
    </div>
  );
}