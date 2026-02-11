"use client";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useTransition } from "react";
import SidebarCart from "../components/SidebarCart";
import ImageSlider from "../components/ImageSlider";
import HeaderNavigation from "../components/HeaderNavigation";
import StickySearchBar from "../components/StickySearchBar";
import { 
  LazyMapWrapper, 
  LazyDestinationDetailWrapper, 
  LazyEventsSliderWrapper,
  LazyMapDiagnosticsWrapper 
} from "../components/LazyComponents";
import { Destination, CartItem } from "../types";
import { ShoppingCartSimple } from "phosphor-react";
import { useLanguage } from "../contexts/LanguageContext";
import { getPriceByLanguage, formatPrice } from "../utils/priceUtils";

const NEW_CATEGORIES = [
  "Alam",
  "Budaya & Sejarah",
  "Kreatif & Edukasi",
  "Kuliner Tersembunyi",
] as const;

type NewCategory = typeof NEW_CATEGORIES[number];

function mapToNewCategory(destination: Destination): NewCategory | null {
  const raw = (destination.kategori || "").toString().toLowerCase();
  const name = (destination.nama || "").toString().toLowerCase();
  const haystack = `${raw} ${name}`;

  const hasAny = (keywords: string[]) => keywords.some(k => haystack.includes(k));

  const alam = [
    "alam", "air terjun", "curug", "pantai", "gunung", "bukit", "hutan", "gua", "goa",
    "danau", "sungai", "puncak", "tebing", "kebun", "taman nasional", "savanna", "savannah",
    "perbukitan", "geopark", "kaldera", "lembah"
  ];
  const budayaSejarah = [
    "budaya", "sejarah", "candi", "keraton", "kraton", "museum", "situs", "heritage",
    "batik", "desa wisata", "kampung", "makam", "benteng", "monumen", "masjid", "gereja",
    "klenteng", "vihara", "pura", "istana"
  ];
  const kreatifEdukasi = [
    "kreatif", "edukasi", "workshop", "galeri", "gallery", "seni", "art", "studio",
    "kursus", "pameran", "kafe unik", "kafe", "cafe", "creative", "edutour", "edutrip",
    "komunitas", "maker", "inovasi"
  ];
  const kuliner = [
    "kuliner", "makanan", "kedai", "warung", "angkringan", "street food", "bakmi", "gudeg",
    "sate", "kopi", "coffee", "roastery", "hidden", "hidden gem", "view", "rooftop"
  ];

  if (hasAny(kuliner)) return "Kuliner Tersembunyi";
  if (hasAny(kreatifEdukasi)) return "Kreatif & Edukasi";
  if (hasAny(budayaSejarah)) return "Budaya & Sejarah";
  if (hasAny(alam)) return "Alam";
  return null;
}

interface WisataListClientProps {
  initialDestinations: Destination[];
}

export default function WisataListClient({ initialDestinations }: WisataListClientProps) {
  const { dictionary, locale } = useLanguage();
  const [isPending, startTransition] = useTransition();
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [kendaraan, setKendaraan] = useState("Mobilio");
  const [visibleSidebar, setVisibleSidebar] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Booking state
  const [tanggalBooking, setTanggalBooking] = useState("");
  const [waktuBooking, setWaktuBooking] = useState("");
  const [jumlahPenumpang, setJumlahPenumpang] = useState(1);

  // Data state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Use initial destinations from server
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);

  // Map state
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Enhanced function for image processing
  const processImageData = useCallback((d: any) => {
    if (!d.img) {
      return null;
    }
    
    if (Array.isArray(d.img) && d.img.length > 0) {
      const flattened: string[] = [];
      for (const entry of d.img) {
        if (typeof entry === 'string') {
          const trimmed = entry.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                for (const u of parsed) {
                  if (typeof u === 'string' && (u.startsWith("http://") || u.startsWith("https://"))) {
                    flattened.push(u);
                  }
                }
                continue;
              }
            } catch {
              // fallthrough
            }
          }
          const unquoted = trimmed.replace(/^\["|\[\'|\"|\']?|[\"\'\]]$/g, '').trim();
          if (unquoted.startsWith('http://') || unquoted.startsWith('https://')) {
            flattened.push(unquoted);
          }
        }
      }
      return flattened.length > 0 ? flattened : d.img;
    }
    
    if (typeof d.img === 'string') {
      try {
        const parsed = JSON.parse(d.img);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        try {
          const cleaned = d.img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // Failed to parse
        }
      }
      
      if (d.img.startsWith('[') && d.img.endsWith(']')) {
        try {
          const urlMatches = d.img.match(/https?:\/\/[^\s,\]]+/g);
          if (urlMatches && urlMatches.length > 0) {
            return urlMatches;
          }
        } catch {
          // Failed
        }
        
        try {
          const content = d.img.slice(1, -1);
          const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
          const validUrls = urls.filter((url: string) => url.startsWith('http'));
          if (validUrls.length > 0) {
            return validUrls;
          }
        } catch {
          // Failed
        }
      }
      
      if (d.img.startsWith('http://') || d.img.startsWith('https://')) {
        return [d.img];
      }
      if (d.img.includes('drive.google.com')) {
        return [d.img];
      }
      if (d.img.includes('.com') || d.img.includes('.org') || d.img.includes('.net')) {
        return [`https://${d.img}`];
      }
      return null;
    }
    
    return null;
  }, []);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("gemitra_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          localStorage.removeItem("gemitra_cart");
          setCart([]);
        }
      }
    } catch {
      localStorage.removeItem("gemitra_cart");
      setCart([]);
    }
    
    const savedKendaraan = localStorage.getItem("gemitra_kendaraan");
    if (savedKendaraan) setKendaraan(savedKendaraan);
    const savedTanggal = localStorage.getItem("gemitra_tanggal");
    if (savedTanggal) setTanggalBooking(savedTanggal);
    const savedWaktu = localStorage.getItem("gemitra_waktu");
    if (savedWaktu) setWaktuBooking(savedWaktu);
    const savedPenumpang = localStorage.getItem("gemitra_penumpang");
    if (savedPenumpang) setJumlahPenumpang(parseInt(savedPenumpang));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && Array.isArray(cart)) {
      try {
        localStorage.setItem("gemitra_cart", JSON.stringify(cart));
      } catch {
        // Handle localStorage error
      }
    }
  }, [cart, hydrated]);
  
  useEffect(() => {
    if (hydrated) localStorage.setItem("gemitra_kendaraan", kendaraan);
  }, [kendaraan, hydrated]);
  
  useEffect(() => {
    if (hydrated) localStorage.setItem("gemitra_tanggal", tanggalBooking);
  }, [tanggalBooking, hydrated]);
  
  useEffect(() => {
    if (hydrated) localStorage.setItem("gemitra_waktu", waktuBooking);
  }, [waktuBooking, hydrated]);
  
  useEffect(() => {
    if (hydrated) localStorage.setItem("gemitra_penumpang", jumlahPenumpang.toString());
  }, [jumlahPenumpang, hydrated]);

  function handleAddToCart(id: number, nama: string, harga?: number, slug?: string) {
    if (cart.find(item => item.id == id)) return;
    if (cart.length >= 3) return;
    
    setCart([...cart, { id, nama, harga, slug }]);
    
    setNotificationMessage(dictionary.wisata.addToCartNotification);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  }
  
  function handleRemoveFromCart(id: number) {
    setCart(cart.filter(item => item.id !== id));
  }

  function handleDestinationClick(destination: Destination) {
    setSelectedDestination(destination);
  }

  const getOriginalCategory = useCallback((translatedCategory: string) => {
    if (translatedCategory === dictionary.wisata.categories.nature) return "Alam";
    if (translatedCategory === dictionary.wisata.categories.cultureHistory) return "Budaya & Sejarah";
    if (translatedCategory === dictionary.wisata.categories.creativeEducation) return "Kreatif & Edukasi";
    if (translatedCategory === dictionary.wisata.categories.hiddenCulinary) return "Kuliner Tersembunyi";
    return translatedCategory;
  }, [dictionary]);

  const filteredData = useMemo(() => {
    return destinations.filter(item => {
      const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
      const mappedCategory = mapToNewCategory(item);
      const originalSelectedCategory = getOriginalCategory(selectedCategory);
      const matchesCategory = !selectedCategory || mappedCategory === originalSelectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [destinations, searchTerm, selectedCategory, getOriginalCategory]);

  const loadMore = useCallback(() => {
    if (visibleCount < filteredData.length && !isLoadingMore) {
      setIsLoadingMore(true);
      requestAnimationFrame(() => {
        setVisibleCount(prev => Math.min(prev + 6, filteredData.length));
        setIsLoadingMore(false);
      });
    }
  }, [visibleCount, filteredData.length, isLoadingMore]);

  useEffect(() => {
    const sentinel = document.getElementById('wisata-scroll-sentinel');
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    }, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  useEffect(() => {
    setVisibleCount(9);
  }, [searchTerm, selectedCategory]);
  
  const getTranslatedCategories = () => {
    return [
      dictionary.wisata.categories.nature,
      dictionary.wisata.categories.cultureHistory,
      dictionary.wisata.categories.creativeEducation,
      dictionary.wisata.categories.hiddenCulinary,
    ];
  };
  
  const categories = getTranslatedCategories();

  // Optimized search handler with transition and debouncing for better INP
  const handleSearchChange = useCallback((value: string) => {
    startTransition(() => {
      setSearchTerm(value);
    });
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    startTransition(() => {
      setSelectedCategory(value);
    });
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10 pt-24">
        <HeaderNavigation />
        <div className="w-full max-w-6xl mx-auto mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden shadow-xl bg-glass animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10 pt-24">
      <HeaderNavigation />
      <StickySearchBar
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
        categories={[...categories]}
        placeholder={dictionary.wisata.searchPlaceholder}
        showViewToggle={true}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div className="w-full max-w-6xl mx-auto mt-8 mb-6 flex-1">
        {/* Events Section - Deferred */}
        <LazyEventsSliderWrapper />
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#213DFF]">{dictionary.wisata.title}</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  viewMode === "list" 
                    ? "bg-[#16A86E] text-white" 
                    : "bg-white text-[#213DFF] border border-[#213DFF]"
                }`}
              >
                {dictionary.wisata.listView}
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  viewMode === "map" 
                    ? "bg-[#16A86E] text-white" 
                    : "bg-white text-[#213DFF] border border-[#213DFF]"
                }`}
              >
                {dictionary.wisata.mapView}
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder={dictionary.wisata.searchPlaceholder}
              className="flex-1 rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
            />
            <select
              className="rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
              value={selectedCategory}
              onChange={e => handleCategoryChange(e.target.value)}
            >
              <option value="">{dictionary.wisata.allCategories}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {viewMode === "list" ? (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.slice(0, visibleCount).map((item, index) => (
              <div key={item.id} className="rounded-3xl overflow-hidden shadow-xl bg-glass">
                <div className="relative w-full h-48">
                  <ImageSlider 
                    images={processImageData(item) || []}
                    alt={item.nama}
                    className="w-full h-full"
                    priority={index < 3} // Priority for first 3 images
                  />
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#213DFF]">{item.nama}</h2>
                    <span className="ml-auto text-[#16A86E] font-bold text-lg">{item.rating}★</span>
                  </div>
                  <span className="text-black/60 text-sm">{item.lokasi} &middot; {item.kategori}</span>
                  {item.harga && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#16A86E] font-bold text-lg">
                        {formatPrice(getPriceByLanguage(item, locale), locale)}
                      </span>
                      <span className="text-gray-500 text-sm">{dictionary.wisata.perPerson}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2 mt-2">
                    <Link
                      href={`/wisata/${item.slug || item.id}`}
                      className="w-full bg-[#16A86E] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#213DFF] transition text-center"
                    >
                      {dictionary.wisata.detailButton}
                    </Link>
                    <button
                      className="w-full bg-[#213DFF] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#16A86E] transition disabled:opacity-50 text-sm"
                      onClick={() => handleAddToCart(item.id, item.nama, item.harga, item.slug)}
                      disabled={cart.length >= 3 || !!cart.find(cartItem => cartItem.id == item.id)}
                    >
                      {dictionary.wisata.addToCart}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {visibleCount < filteredData.length && (
            <div id="wisata-scroll-sentinel" className="py-8 text-center">
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#16A86E]"></div>
                  <span className="text-gray-600">{dictionary.wisata.loadingMore}</span>
                </div>
              ) : (
                <button
                  onClick={loadMore}
                  className="bg-[#16A86E] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#213DFF] transition-all transform hover:scale-105"
                >
                  {dictionary.wisata.loadMoreButton}
                </button>
              )}
            </div>
          )}
          {visibleCount >= filteredData.length && filteredData.length > 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-gray-600">{dictionary.wisata.allDestinationsShown}</p>
            </div>
          )}
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LazyMapDiagnosticsWrapper destinations={filteredData} />
            <LazyMapWrapper
              destinations={filteredData}
              onDestinationClick={handleDestinationClick}
              selectedDestination={selectedDestination}
            />
            <LazyDestinationDetailWrapper
              destination={selectedDestination}
              onClose={() => setSelectedDestination(null)}
            />
          </div>
        )}
      </div>
      
      {!visibleSidebar && (
        <button
          className="fixed right-4 bottom-4 z-40 bg-[#213DFF] text-white p-4 rounded-full shadow-lg hover:bg-[#16A86E] transition flex items-center justify-center cursor-pointer"
          style={{ boxShadow: "0 4px 24px 0 #213DFF22" }}
          onClick={() => setVisibleSidebar(true)}
          aria-label={dictionary.wisata.showCart}
        >
          <ShoppingCartSimple size={28} weight="bold" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}
      
      <SidebarCart
        cart={cart}
        kendaraan={kendaraan}
        tanggalBooking={tanggalBooking}
        waktuBooking={waktuBooking}
        jumlahPenumpang={jumlahPenumpang}
        visible={visibleSidebar}
        onClose={() => setVisibleSidebar(false)}
        onRemoveFromCart={handleRemoveFromCart}
        onKendaraanChange={setKendaraan}
        onTanggalChange={setTanggalBooking}
        onWaktuChange={setWaktuBooking}
        onPenumpangChange={setJumlahPenumpang}
        onCartUpdate={setCart}
      />
      
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 animate-bounce">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="flex flex-col">
              <span className="font-semibold">{notificationMessage}</span>
              <span className="text-xs opacity-90">{dictionary.wisata.checkoutNotification}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

