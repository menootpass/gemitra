"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import SidebarCart from "../../components/SidebarCart";

const kendaraanList = ["Mobilio", "Innova Reborn", "HIACE"];

export default function WisataDetail() {
  const params = useParams();
  const id = params.id;

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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`https://sheetdb.io/api/v1/7ske65b4rjfi4/search?id=${id}`)
      .then(res => res.json())
      .then(res => {
        if (res && res.length > 0) {
          // Mapping: fasilitas dan komentar dari string ke array
          const d = res[0];
          d.fasilitas = d.fasilitas ? d.fasilitas.split(",") : [];
          try {
            d.komentar = d.komentar ? JSON.parse(d.komentar) : [];
          } catch {
            d.komentar = [];
          }
          setData(d);
        } else {
          setData(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal mengambil data destinasi");
        setLoading(false);
      });
  }, [id]);

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

  function handleAddToCart() {
    if (!data) return;
    if (cart.find(item => item.id == data.id)) return;
    if (cart.length >= 3) return;
    setCart([...cart, { id: data.id, nama: data.nama }]);
  }
  function handleRemoveFromCart(id: number) {
    setCart(cart.filter(item => item.id !== id));
  }

  if (!hydrated || loading) return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      <div className="w-full max-w-3xl mx-auto mt-8 mb-6 flex-1">
        <div className="rounded-3xl overflow-hidden shadow-xl bg-glass">
          <div className="w-full h-60 sm:h-80 bg-gray-200 animate-pulse"></div>
          <div className="p-4 border-b border-[#213DFF11] flex justify-end">
            <div className="h-10 w-48 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="mb-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center text-black/60">Wisata tidak ditemukan.</div>;

  return (
    <div className="min-h-screen w-full bg-white bg-gradient-indie flex flex-col md:flex-row items-center md:items-start font-sans px-4 pb-10">
      {/* Main Content */}
      <div className="w-full max-w-3xl mx-auto mt-8 mb-6 flex-1">
        <div className="rounded-3xl overflow-hidden shadow-xl bg-glass">
          <div className="relative w-full h-60 sm:h-80">
            <Image src={data.img} alt={data.nama} fill className="object-cover w-full h-full" />
          </div>
          {/* Tombol Tambahkan Destinasi Wisata */}
          <div className="p-4 border-b border-[#213DFF11] flex justify-end">
            <button
              className="bg-[#16A86E] text-white font-bold px-5 py-2 rounded-full shadow hover:bg-[#213DFF] transition disabled:opacity-50"
              onClick={handleAddToCart}
              disabled={cart.length >= 3 || !!cart.find(item => item.id == data.id)}
            >
              Tambahkan destinasi wisata
            </button>
          </div>
          <div className="p-6 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#213DFF]">{data.nama}</h1>
              <span className="ml-auto text-[#16A86E] font-bold text-lg">{data.rating}★</span>
            </div>
            <span className="text-black/60 text-sm mb-2">{data.lokasi} &middot; {data.kategori}</span>
            <p className="text-black/80 text-base mb-2">{data.deskripsi}</p>
            <div className="mb-2">
              <h2 className="font-bold text-[#16A86E] mb-1">Fasilitas</h2>
              <ul className="flex flex-wrap gap-2">
                {data.fasilitas.map((f: string) => (
                  <li key={f} className="px-3 py-1 rounded-full bg-[#213DFF11] text-[#213DFF] text-xs font-semibold">{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-bold text-[#16A86E] mb-1">Komentar</h2>
              <ul className="flex flex-col gap-2">
                {data.komentar.map((k: any, i: number) => (
                  <li key={i} className="bg-[#16A86E11] rounded-xl px-3 py-2 text-sm">
                    <span className="font-bold text-[#16A86E]">{k.nama}:</span> {k.komentar || k.isi}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
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