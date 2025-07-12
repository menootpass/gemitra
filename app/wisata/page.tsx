"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import SidebarCart from "../components/SidebarCart";
import GemitraMap from "../components/GemitraMap";
import DestinationDetail from "../components/DestinationDetail";

const kendaraanList = ["Mobilio", "Innova Reborn", "HIACE"];

export default function WisataList() {
  // Cart state
  const [cart, setCart] = useState<{ id: number; nama: string }[]>([]);
  const [kendaraan, setKendaraan] = useState("Mobilio");
  const [visibleSidebar, setVisibleSidebar] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Booking state
  const [tanggalBooking, setTanggalBooking] = useState("");
  const [waktuBooking, setWaktuBooking] = useState("");
  const [jumlahPenumpang, setJumlahPenumpang] = useState(1);

  // Data state
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Map state
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  useEffect(() => {
    setLoading(true);
    fetch("https://sheetdb.io/api/v1/7ske65b4rjfi4")
      .then(res => res.json())
      .then(res => {
        // Process data for map
        const processedData = res.map((item: any) => ({
          ...item,
          fasilitas: item.fasilitas ? item.fasilitas.split(",") : [],
          komentar: item.komentar ? (() => {
            try {
              return JSON.parse(item.komentar);
            } catch {
              return [];
            }
          })() : []
        }));
        setData(processedData);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data destinasi");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem("gemitra_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
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
    if (hydrated) localStorage.setItem("gemitra_cart", JSON.stringify(cart));
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

  function handleAddToCart(id: number, nama: string) {
    if (cart.find(item => item.id == id)) return;
    if (cart.length >= 3) return;
    setCart([...cart, { id, nama }]);
  }
  function handleRemoveFromCart(id: number) {
    setCart(cart.filter(item => item.id !== id));
  }

  function handleDestinationClick(destination: any) {
    setSelectedDestination(destination);
  }

  const filteredData = data.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.kategori === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(data.map(item => item.kategori))];

  if (!hydrated || loading) return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      <div className="w-full max-w-6xl mx-auto mt-8 mb-6 flex-1">
        <div className="mb-8">
          <div className="h-10 bg-gray-200 rounded-xl animate-pulse mb-4"></div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-12 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl overflow-hidden shadow-xl bg-glass">
              <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-6 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse flex-1"></div>
                  <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

        {viewMode === "list" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map(item => (
              <div key={item.id} className="rounded-3xl overflow-hidden shadow-xl bg-glass">
                <div className="relative w-full h-48">
                  <Image src={item.img} alt={item.nama} fill className="object-cover w-full h-full" />
                </div>
                <div className="p-6 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#213DFF]">{item.nama}</h2>
                    <span className="ml-auto text-[#16A86E] font-bold text-lg">{item.rating}★</span>
                  </div>
                  <span className="text-black/60 text-sm">{item.lokasi} &middot; {item.kategori}</span>
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/wisata/${item.id}`}
                      className="flex-1 bg-[#16A86E] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#213DFF] transition text-center"
                    >
                      Detail
                    </Link>
                    <button
                      className="bg-[#213DFF] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#16A86E] transition disabled:opacity-50"
                      onClick={() => handleAddToCart(item.id, item.nama)}
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
      {/* Sidebar Cart */}
      <SidebarCart
        cart={cart}
        onRemove={handleRemoveFromCart}
        kendaraan={kendaraan}
        setKendaraan={setKendaraan}
        onCheckout={() => alert('Transaksi lanjut!')}
        visible={visibleSidebar}
        setVisible={setVisibleSidebar}
        tanggalBooking={tanggalBooking}
        setTanggalBooking={setTanggalBooking}
        waktuBooking={waktuBooking}
        setWaktuBooking={setWaktuBooking}
        jumlahPenumpang={jumlahPenumpang}
        setJumlahPenumpang={setJumlahPenumpang}
      />
    </div>
  );
} 