"use client";
import React, { useEffect } from "react";
import { ShoppingCartSimple, XSquare } from "phosphor-react";

const kendaraanList = ["Mobilio", "Innova Reborn", "HIACE"];

// Vehicle passenger limits
const vehicleLimits = {
  "Mobilio": 4,
  "Innova Reborn": 6,
  "HIACE": 11
};

type CartItem = { id: number; nama: string };

type SidebarCartProps = {
  cart: CartItem[];
  onRemove: (id: number) => void;
  kendaraan: string;
  setKendaraan: (k: string) => void;
  onCheckout: () => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
  // New props for booking details
  tanggalBooking: string;
  setTanggalBooking: (date: string) => void;
  waktuBooking: string;
  setWaktuBooking: (time: string) => void;
  jumlahPenumpang: number;
  setJumlahPenumpang: (count: number) => void;
};

export default function SidebarCart({ 
  cart, 
  onRemove, 
  kendaraan, 
  setKendaraan, 
  onCheckout, 
  visible, 
  setVisible,
  tanggalBooking,
  setTanggalBooking,
  waktuBooking,
  setWaktuBooking,
  jumlahPenumpang,
  setJumlahPenumpang
}: SidebarCartProps) {
  // Get current date for min date
  const today = new Date().toISOString().split('T')[0];
  const maxPassengers = vehicleLimits[kendaraan as keyof typeof vehicleLimits] || 4;

  // Reset passenger count when vehicle changes
  useEffect(() => {
    if (jumlahPenumpang > maxPassengers) {
      setJumlahPenumpang(maxPassengers);
    }
  }, [kendaraan, jumlahPenumpang, maxPassengers, setJumlahPenumpang]);

  if (!visible) {
    return (
      <button
        className="fixed right-4 bottom-4 z-40 bg-[#213DFF] text-white p-4 rounded-full shadow-lg hover:bg-[#16A86E] transition flex items-center justify-center"
        style={{ boxShadow: "0 4px 24px 0 #213DFF22" }}
        onClick={() => setVisible(true)}
        aria-label="Tampilkan Cart"
      >
        <ShoppingCartSimple size={28} weight="bold" />
      </button>
    );
  }
  return (
    <aside className="fixed md:fixed top-auto md:top-0 right-0 w-full md:w-80 h-auto md:h-screen min-h-0 md:min-h-screen bg-glass md:bg-white/90 md:border-l md:border-[#213DFF11] flex flex-col gap-4 p-5 md:p-8 z-40 md:mt-0 md:ml-0 shadow-xl md:rounded-none rounded-t-2xl md:rounded-none transition-all" style={{ bottom: 0 }}>
      <button
        className="absolute top-4 left-4 text-[#213DFF] hover:text-[#16A86E] p-2 rounded-lg hover:bg-[#213DFF11] transition"
        onClick={() => setVisible(false)}
        aria-label="Sembunyikan Cart"
      >
        <XSquare size={24} weight="bold" />
      </button>
      <h2 className="font-bold text-[#213DFF] mt-8 mb-3 text-lg">Cart Destinasi (max 3)</h2>
      {cart.length === 0 ? (
        <div className="text-black/50 text-sm">Belum ada destinasi.</div>
      ) : (
        <ul className="flex flex-col gap-2 mb-2">
          {cart.map(item => (
            <li key={item.id} className="flex items-center justify-between bg-[#213DFF11] rounded-xl px-3 py-2 text-sm">
              <span>{item.nama}</span>
              <button className="text-[#16A86E] font-bold ml-2" onClick={() => onRemove(item.id)}>&times;</button>
            </li>
          ))}
        </ul>
      )}
      
      {/* Booking Details Section */}
      <div className="space-y-4">
        <div>
          <label htmlFor="kendaraan" className="block text-black/70 mb-1 font-medium">Pilih Kendaraan</label>
          <select
            id="kendaraan"
            className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
            value={kendaraan}
            onChange={e => setKendaraan(e.target.value)}
          >
            {kendaraanList.map(k => (
              <option key={k} value={k}>{k} (max {vehicleLimits[k as keyof typeof vehicleLimits]} penumpang)</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tanggal" className="block text-black/70 mb-1 font-medium">Tanggal Booking</label>
          <input
            type="date"
            id="tanggal"
            className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
            value={tanggalBooking}
            onChange={e => setTanggalBooking(e.target.value)}
            min={today}
          />
        </div>

        <div>
          <label htmlFor="waktu" className="block text-black/70 mb-1 font-medium">Waktu Booking</label>
          <input
            type="time"
            id="waktu"
            className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
            value={waktuBooking}
            onChange={e => setWaktuBooking(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="penumpang" className="block text-black/70 mb-1 font-medium">
            Jumlah Penumpang (max {maxPassengers})
          </label>
          <input
            type="number"
            id="penumpang"
            className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
            value={jumlahPenumpang}
            onChange={e => {
              const value = parseInt(e.target.value);
              if (value >= 1 && value <= maxPassengers) {
                setJumlahPenumpang(value);
              }
            }}
            min="1"
            max={maxPassengers}
          />
        </div>
      </div>

      <button
        className="mt-6 bg-[#213DFF] text-white font-bold px-6 py-2 rounded-full shadow hover:bg-[#16A86E] transition disabled:opacity-50 text-base"
        onClick={onCheckout}
        disabled={cart.length === 0 || !tanggalBooking || !waktuBooking || jumlahPenumpang < 1}
      >
        Lanjutkan Transaksi
      </button>
    </aside>
  );
} 