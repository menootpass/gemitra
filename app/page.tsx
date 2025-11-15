"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Destination } from "./types";
import HeaderNavigation from "./components/HeaderNavigation";

// Dynamic imports for better code splitting
const DestinationDetail = dynamic(() => import("./components/DestinationDetail"), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-32"></div>,
});

const LoadingSkeleton = dynamic(() => import("./components/LoadingSkeleton"), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-32"></div>,
});

const LazyMap = dynamic(() => import("./components/LazyMap"), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-96"></div>,
});

const LazyFeedbackForm = dynamic(() => import("./components/LazyFeedbackForm"), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-64"></div>,
});

// Lazy load UI components
const Button = dynamic(() => import("@/components/ui/button").then(mod => ({ default: mod.Button })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-10 w-24"></div>,
});

const Card = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.Card })), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-32"></div>,
});

const CardContent = dynamic(() => import("@/components/ui/card").then(mod => ({ default: mod.CardContent })), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded h-24"></div>,
});

const Badge = dynamic(() => import("@/components/ui/badge").then(mod => ({ default: mod.Badge })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded-full h-6 w-16"></div>,
});

const Input = dynamic(() => import("@/components/ui/input").then(mod => ({ default: mod.Input })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-10"></div>,
});

// Lazy load icons
const MapPin = dynamic(() => import("lucide-react").then(mod => ({ default: mod.MapPin })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const Star = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Star })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const MessageCircle = dynamic(() => import("lucide-react").then(mod => ({ default: mod.MessageCircle })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const ArrowRight = dynamic(() => import("lucide-react").then(mod => ({ default: mod.ArrowRight })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const Camera = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Camera })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const Compass = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Compass })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const PhoneIcon = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Phone })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const MailIcon = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Mail })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const GlobeIcon = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Globe })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const InstagramIcon = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Instagram })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

const FacebookIcon = dynamic(() => import("lucide-react").then(mod => ({ default: mod.Facebook })), {
  loading: () => <div className="animate-pulse bg-gray-300 rounded h-4 w-4"></div>,
});

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

  // Helper untuk memproses data gambar destinasi
  const extractImageUrls = (img: Destination["img"]): string[] => {
    if (!img) return [];

    if (Array.isArray(img)) {
      return img
        .map((url) => (typeof url === "string" ? url.trim() : ""))
        .filter((url) => url && url.startsWith("http"));
    }

    if (typeof img === "string") {
      const trimmed = img.trim();
      if (!trimmed) return [];

      // Coba parse sebagai JSON
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((url) => (typeof url === "string" ? url.trim() : ""))
            .filter((url) => url && url.startsWith("http"));
        }
      } catch {
        try {
          const cleaned = trimmed.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            return parsed
              .map((url) => (typeof url === "string" ? url.trim() : ""))
              .filter((url) => url && url.startsWith("http"));
          }
        } catch {
          // abaikan, lanjutkan parsing manual
        }
      }

      // Jika string array seperti [url1, url2]
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const content = trimmed.slice(1, -1);
        const urls = content
          .split(",")
          .map((url) => url.trim().replace(/^["']|["']$/g, ""))
          .filter((url) => url.startsWith("http"));
        if (urls.length) return urls;
      }

      if (trimmed.startsWith("http")) {
        return [trimmed];
      }
    }

    return [];
  };

  const getCoverImage = (destination: Destination): string => {
    const urls = extractImageUrls(destination.img);
    return urls[0] || "/images/klangon.jpg";
  };

  const masterpieceDestinations = useMemo(() => {
    if (!destinations || destinations.length === 0) return [];

    const sorted = [...destinations].sort((a, b) => {
      const ratingA = Number(a.rating) || 0;
      const ratingB = Number(b.rating) || 0;
      return ratingB - ratingA;
    });

    return sorted.slice(0, 8);
  }, [destinations]);

  const displayedMasterpieces = useMemo(() => {
    if (masterpieceDestinations.length > 0) {
      return masterpieceDestinations;
    }
    return destinations.slice(0, 5);
  }, [masterpieceDestinations, destinations]);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  // Duplicate items untuk infinite scroll yang seamless
  const loopedMasterpieces = useMemo(() => {
    if (displayedMasterpieces.length === 0) return [];
    // Duplicate 3x untuk memastikan infinite scroll yang smooth
    return [...displayedMasterpieces, ...displayedMasterpieces, ...displayedMasterpieces];
  }, [displayedMasterpieces]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container || loopedMasterpieces.length <= 1) return;

    // Hitung lebar satu set item (setelah duplicate)
    const singleSetWidth = container.scrollWidth / 3;
    const SPEED_PX_PER_MS = 0.15; // Kecepatan scroll (bisa disesuaikan)
    let lastTimestamp: number | null = null;
    let isHover = false;
    let isPaused = false;

    const handleMouseEnter = () => {
      isHover = true;
    };

    const handleMouseLeave = () => {
      isHover = false;
    };

    const handleMouseDown = () => {
      isPaused = true;
    };

    const handleMouseUp = () => {
      isPaused = false;
    };

    const animate = (timestamp: number) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const delta = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      if (!isHover && !isPaused) {
        container.scrollLeft += SPEED_PX_PER_MS * delta;

        // Reset ke posisi awal ketika mencapai akhir set pertama
        // Ini membuat infinite scroll yang seamless
        if (container.scrollLeft >= singleSetWidth) {
          container.scrollLeft -= singleSetWidth;
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("touchstart", handleMouseDown);
    container.addEventListener("touchend", handleMouseUp);

    // Start dari set kedua untuk memastikan ada ruang untuk scroll ke belakang
    container.scrollLeft = singleSetWidth;

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("touchstart", handleMouseDown);
      container.removeEventListener("touchend", handleMouseUp);
    };
  }, [loopedMasterpieces.length]);

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
            <Image src="/images/brandman-transparant.png" alt="Hero Person" width={320} height={320} className="object-cover w-full h-80" priority />
          </div>
          <div className="absolute -top-6 -right-6 hidden md:block">
            <Image src="/svg/cursor-click.svg" alt="Decorative Pointer" width={48} height={48} />
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
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#213DFF] mb-6 md:mb-8 text-center md:text-left">
          {dictionary.sections.exploreHiddenBeauty}
        </h2>

        <div className="relative">
          <div
            id="masterpieces-carousel"
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 md:gap-8 pb-6 snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {loopedMasterpieces.map((destination, index) => (
              <div
                key={`masterpiece-${destination.id}-${destination.slug}-${index}`}
                className="group relative min-w-[220px] sm:min-w-[260px] lg:min-w-[280px] snap-center"
              >
                <div className="relative h-72 sm:h-80 rounded-3xl overflow-hidden shadow-xl transition-transform duration-500 ease-out group-hover:scale-105 group-hover:shadow-2xl">
                  <Image
                    src={getCoverImage(destination)}
                    alt={destination.nama}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 75vw, 320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-lg font-extrabold drop-shadow-lg">{destination.nama}</h3>
                    <p className="text-sm text-white/80">
                      {destination.lokasi || destination.kategori || "Yogyakarta, Indonesia"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <style jsx>{`
            #masterpieces-carousel::-webkit-scrollbar {
              display: none;
            }
          `}</style>
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
              <Image src="/images/brandman-transparant.png" alt="Expert" width={320} height={220} className="object-cover w-full h-56" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <Link
              href="https://wa.me/6285701834668?text=Halo%20Gemitra!%20Saya%20ingin%20konsultasi%20trip%20gratis."
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-[#16A86E] text-white px-4 md:px-5 py-2 rounded-full shadow font-bold text-sm md:text-base flex items-center gap-2 hover:bg-[#213DFF] transition-colors"
            >
              <span>{dictionary.sections.freeConsultation}</span>
              <Image src="/svg/cursor-click.svg" alt="Pointer" width={24} height={24} />
            </Link>
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
        
        <LazyMap
              destinations={destinations}
              onDestinationClick={handleDestinationClick}
              selectedDestination={selectedDestination}
          loading={loading}
          error={error}
          refresh={refresh}
          isOnline={isOnline}
          retryCount={retryCount}
            />
          <DestinationDetail
            destination={selectedDestination}
            onClose={() => setSelectedDestination(null)}
          />
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
        <LazyFeedbackForm />
      </section>

      {/* Footer */}
      <footer className="w-full mt-14 md:mt-20 bg-gradient-to-r from-[#0F8F5C] via-[#16A86E] to-[#1FBF7A] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <Image
                src="/svg/gemitra-text-white.svg"
                alt="Gemitra Tour logo"
                width={140}
                height={160}
                className="h-14 w-auto mb-3"
                priority
              />
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-2 leading-tight">
                Explore Hidden Paradise with Local Experts
              </h3>
              <p className="text-white/80 text-sm mt-3">
                Travel agency profesional yang menghadirkan pengalaman berwisata personalized di seluruh Indonesia,
                khususnya Yogyakarta dan sekitarnya.
              </p>
              <div className="mt-4 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 backdrop-blur-sm w-fit">
                <GlobeIcon className="w-4 h-4 text-white" />
                <Link href="https://gemitra.com" target="_blank" className="text-sm font-semibold underline-offset-4 hover:underline">
                  gemitra.com
                </Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 uppercase tracking-wide">Kontak</h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <PhoneIcon className="w-4 h-4" />
                  <a href="tel:+6285701834668" className="hover:text-white transition">+62 857-0183-4668</a>
                </li>
                <li className="flex items-center gap-3">
                  <MailIcon className="w-4 h-4" />
                  <a href="mailto:gemitrayogyakarta@gemitra.com" className="hover:text-white transition">gemitrayogyakarta@gemitra.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>Babadan Girikerto Turi Sleman Yogyakarta, Indonesia</span>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="w-4 h-4" />
                  <a href="https://wa.me/6285701834668" target="_blank" className="hover:text-white transition">
                    WhatsApp Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 uppercase tracking-wide">Navigasi</h4>
              <ul className="space-y-2 text-sm text-white/80">
                <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
                <li><Link href="/wisata" className="hover:text-white transition">Destinasi Wisata</Link></li>
                <li><Link href="/paket" className="hover:text-white transition">Paket Liburan</Link></li>
                <li><Link href="/sewa-mobil" className="hover:text-white transition">Sewa Kendaraan</Link></li>
                <li><Link href="/artikel" className="hover:text-white transition">Inspirasi & Artikel</Link></li>
                <li><Link href="/kontak" className="hover:text-white transition">Hubungi Kami</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 uppercase tracking-wide">Sosial Media</h4>
              <p className="text-sm text-white/80 mb-4">
                Ikuti perjalanan terbaru dan promo eksklusif Gemitra Tour di setiap platform favorit Anda.
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="https://instagram.com/gemitra_jogja" target="_blank" className="flex items-center gap-3 hover:text-white transition">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20">
                      <InstagramIcon className="w-4 h-4" />
                    </span>
                    <span>@gemitra_jogja</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=61579414105729" target="_blank" className="flex items-center gap-3 hover:text-white transition">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20">
                      <FacebookIcon className="w-4 h-4" />
                    </span>
                    <span>Gemitra Yogyakarta</span>
                  </a>
                </li>
                <li>
                  <a href="https://www.tiktok.com/@gemitra_jogja" target="_blank" className="flex items-center gap-3 hover:text-white transition">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </span>
                    <span>@gemitra_jogja</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/70">
            <p>© {new Date().getFullYear()} Gemitra Tour. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition">Kebijakan Privasi</Link>
              <Link href="/terms" className="hover:text-white transition">Syarat & Ketentuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}