"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import SidebarCart from "../components/SidebarCart";
import GemitraMap from "../components/GemitraMap";
import DestinationDetail from "../components/DestinationDetail";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { Destination, CartItem } from "../types";
import { ShoppingCartSimple } from "phosphor-react";

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
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map state
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Polling fetch destinasi
  useEffect(() => {
    let isMounted = true;
    const fetchDestinations = async () => {
      try {
        const res = await fetch("https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec");
        const data = await res.json();
        const parsed = data.data.map((d: any) => ({
          ...d,
          img: d.img || null, // Ensure img is not empty string
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
          setError(null);
        }
      } catch {
        if (isMounted) {
          setLoading(false);
          setError("Gagal mengambil data destinasi");
        }
      }
    };
    fetchDestinations();
    const interval = setInterval(fetchDestinations, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
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
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
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
    const matchesCategory = !selectedCategory || item.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const categories = [...new Set(destinations.map(item => item.kategori))];

  if (!hydrated || loading) return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      <LoadingSkeleton type="list" count={6} />
    </div>
  );
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto mt-8 mb-6 flex-1">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#213DFF]">Destinasi Wisata</h1>
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
              onClick={() => {
                setLoading(true);
                setError(null);
                fetch("https://script.google.com/macros/s/AKfycbxh1N6MGxG9zr-YirAVbNG67PNGXiJSMNIy18RUhgjIxUPIcTjPPjik_DVt92Qe3wuWiQ/exec")
                  .then(res => res.json())
                  .then(data => {
                            const parsed = data.data.map((d: any) => ({
          ...d,
          img: d.img || null, // Ensure img is not empty string
          posisi: d.posisi ? JSON.parse(d.posisi) : null,
        }));
                    setDestinations(parsed);
                    setLoading(false);
                    setError(null);
                  })
                  .catch(() => {
                    setLoading(false);
                    setError("Gagal mengambil data destinasi");
                  });
              }}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {viewMode === "list" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map(item => (
              <div key={item.id} className="rounded-3xl overflow-hidden shadow-xl bg-glass">
                <div className="relative w-full h-48">
                  {item.img ? (
                    <Image src={item.img} alt={item.nama} fill className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <div className="text-4xl mb-2">🏞️</div>
                        <div className="text-sm">No Image</div>
                      </div>
                    </div>
                  )}
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
                      {/* <span className="text-gray-500 text-sm">per destinasi</span> */}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/wisata/${item.id}`}
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