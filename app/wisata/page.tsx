"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import SidebarCart from "../components/SidebarCart";
import GemitraMap from "../components/GemitraMap";
import DestinationDetail from "../components/DestinationDetail";
import LoadingSkeleton from "../components/LoadingSkeleton";
import ImageSlider from "../components/ImageSlider";
import EventsSlider from "../components/EventsSlider";
import HeaderNavigation from "../components/HeaderNavigation";
import { Destination, CartItem } from "../types";
import { ShoppingCartSimple } from "phosphor-react";
import { useDestinationsSWR } from "../hooks/useDestinationsSWR";

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

  // Priority: Kuliner-specific first, then Kreatif (kafe unik, workshop), then Budaya/Sejarah, then Alam
  if (hasAny(kuliner)) return "Kuliner Tersembunyi";
  if (hasAny(kreatifEdukasi)) return "Kreatif & Edukasi";
  if (hasAny(budayaSejarah)) return "Budaya & Sejarah";
  if (hasAny(alam)) return "Alam";
  return null;
}

export default function WisataList() {
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [kendaraan, setKendaraan] = useState("Mobilio");
  const [visibleSidebar, setVisibleSidebar] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Booking state
  const [tanggalBooking, setTanggalBooking] = useState("");
  const [waktuBooking, setWaktuBooking] = useState("");
  const [jumlahPenumpang, setJumlahPenumpang] = useState(1);

  // Data state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Use destinations hook with SWR
  const { 
    destinations, 
    loading, 
    error, 
    mutate: refresh
  } = useDestinationsSWR({
    refreshInterval: 10000, // Update setiap 10 detik
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  // Map state
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Enhanced function for image processing
  const processImageData = (d: any) => {
    if (!d.img) {
      return null;
    }
    
    // If img is already an array, return the whole array
    if (Array.isArray(d.img) && d.img.length > 0) {
      // Sanitize each element in case it contains a stringified array
      const flattened: string[] = [];
      for (const entry of d.img) {
        if (typeof entry === 'string') {
          const trimmed = entry.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                for (const u of parsed) {
                  if (typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'))) {
                    flattened.push(u);
                  }
                }
                continue;
              }
            } catch {
              // fallthrough to push sanitized single url below
            }
          }
          // Strip surrounding quotes if present
          const unquoted = trimmed.replace(/^\["|\[\'|\"|\']?|[\"\'\]]$/g, '').trim();
          if (unquoted.startsWith('http://') || unquoted.startsWith('https://')) {
            flattened.push(unquoted);
          }
        }
      }
      return flattened.length > 0 ? flattened : d.img;
    }
    
    // If img is a string, it might be a JSON array string
    if (typeof d.img === 'string') {
      // Try to parse as JSON array first
      try {
        const parsed = JSON.parse(d.img);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // If JSON parsing fails, try to clean the string first
        try {
          // Remove any problematic characters and try again
          const cleaned = d.img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch {
          // Failed to parse even after cleaning
        }
      }
      
      // Check if it looks like an array string (starts with [ and ends with ])
      if (d.img.startsWith('[') && d.img.endsWith(']')) {
        try {
          // Try to extract URLs from the string manually
          const urlMatches = d.img.match(/https?:\/\/[^\s,\]]+/g);
          if (urlMatches && urlMatches.length > 0) {
            return urlMatches;
          }
        } catch {
          // Failed to extract URLs
        }
        
        // If regex extraction fails, try manual parsing
        try {
          // Remove brackets and split by comma
          const content = d.img.slice(1, -1); // Remove [ and ]
          const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
          const validUrls = urls.filter((url: string) => url.startsWith('http'));
          if (validUrls.length > 0) {
            return validUrls;
          }
        } catch {
          // Failed manual extraction
        }
        
        // Additional parsing for array format like [url1, url2]
        try {
          // Remove brackets and split by comma, handling quotes
          const content = d.img.slice(1, -1); // Remove [ and ]
          const urls = content.split(',').map((url: string) => {
            const trimmed = url.trim();
            // Remove quotes if present
            return trimmed.replace(/^["']|["']$/g, '');
          });
          const validUrls = urls.filter((url: string) => url.startsWith('http'));
          if (validUrls.length > 0) {
            return validUrls;
          }
        } catch {
          // Failed additional parsing
        }
      }
      
      // If it's a valid URL, return it as array
      if (d.img.startsWith('http://') || d.img.startsWith('https://')) {
        return [d.img];
      }
      // Check if it's a Google Drive URL format (even without http/https)
      if (d.img.includes('drive.google.com')) {
        return [d.img];
      }
      // If it looks like a URL but doesn't start with http/https, try to fix it
      if (d.img.includes('.com') || d.img.includes('.org') || d.img.includes('.net')) {
        return [`https://${d.img}`];
      }
      return null;
    }
    
    return null;
  };



  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("gemitra_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        } else {
          console.warn('Invalid cart data in localStorage, resetting to empty array');
          localStorage.removeItem("gemitra_cart"); // Clean up invalid data
          setCart([]);
        }
      }
    } catch {
      localStorage.removeItem("gemitra_cart"); // Clean up invalid data
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

  function handleAddToCart(id: number, nama: string, harga?: number) {
    if (cart.find(item => item.id == id)) return;
    if (cart.length >= 3) return;
    setCart([...cart, { id, nama, harga }]);
  }
  function handleRemoveFromCart(id: number) {
    setCart(cart.filter(item => item.id !== id));
  }



  function handleDestinationClick(destination: Destination) {
    setSelectedDestination(destination);
  }

  // Ganti data/filtering dari custom hook ke state polling
  const filteredData = destinations.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const mappedCategory = mapToNewCategory(item);
    const matchesCategory = !selectedCategory || mappedCategory === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const categories = NEW_CATEGORIES as readonly string[];

  if (!hydrated || loading) return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      <LoadingSkeleton type="list" count={6} />
    </div>
  );
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10 pt-24">
      <HeaderNavigation />
      
      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto mt-8 mb-6 flex-1">
        {/* Events Section */}
        <EventsSlider />
        
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#213DFF]">Destinasi Wisata</h1>
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
                List
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-full font-bold transition ${
                  viewMode === "map" 
                    ? "bg-[#16A86E] text-white" 
                    : "bg-white text-[#213DFF] border border-[#213DFF]"
                }`}
              >
                Peta
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Cari destinasi..."
              className="flex-1 rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <select
              className="rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
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

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
            <button 
              onClick={() => refresh()}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {viewMode === "list" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((item, index) => (
              <div key={item.id} className="rounded-3xl overflow-hidden shadow-xl bg-glass">
                <div className="relative w-full h-48">
                  <ImageSlider 
                    images={processImageData(item) || []}
                    alt={item.nama}
                    className="w-full h-full"
                    priority={index === 0}
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
                        Rp {item.harga.toLocaleString("id-ID")}
                      </span>
                      <span className="text-gray-500 text-sm">per person</span>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/wisata/${item.slug || item.id}`}
                      className="flex-1 bg-[#16A86E] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#213DFF] transition text-center"
                    >
                      Detail
                    </Link>
                    <button
                      className="bg-[#213DFF] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#16A86E] transition disabled:opacity-50"
                      onClick={() => handleAddToCart(item.id, item.nama, item.harga)}
                      disabled={cart.length >= 3 || !!cart.find(cartItem => cartItem.id == item.id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GemitraMap
              destinations={filteredData}
              onDestinationClick={handleDestinationClick}
              selectedDestination={selectedDestination}
            />
            <DestinationDetail
              destination={selectedDestination}
              onClose={() => setSelectedDestination(null)}
            />
          </div>
        )}
      </div>
      
      {/* Sidebar Cart Trigger Button */}
      {!visibleSidebar && (
        <button
          className="fixed right-4 bottom-4 z-40 bg-[#213DFF] text-white p-4 rounded-full shadow-lg hover:bg-[#16A86E] transition flex items-center justify-center cursor-pointer"
          style={{ boxShadow: "0 4px 24px 0 #213DFF22" }}
          onClick={() => setVisibleSidebar(true)}
          aria-label="Tampilkan Cart"
        >
          <ShoppingCartSimple size={28} weight="bold" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      )}
      {/* Sidebar Cart */}
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
    </div>
  );
}