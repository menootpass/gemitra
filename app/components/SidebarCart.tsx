"use client";
import React, { useEffect, useState } from "react";
import { ShoppingCartSimple, XSquare } from "phosphor-react";
import { CartItem } from "../types";
import { apiService } from "../services/api";

const kendaraanList = ["Mobilio", "Innova Reborn", "HIACE"];

const maxPassengersPerVehicle: { [key: string]: number } = {
  "Mobilio": 6,
  "Innova Reborn": 6,
  "HIACE": 11
};

type SidebarCartProps = {
  cart: CartItem[];
  kendaraan: string;
  tanggalBooking: string;
  waktuBooking: string;
  jumlahPenumpang: number;
  visible: boolean;
  onClose: () => void;
  onRemoveFromCart: (id: number) => void;
  onKendaraanChange: (kendaraan: string) => void;
  onTanggalChange: (tanggal: string) => void;
  onWaktuChange: (waktu: string) => void;
  onPenumpangChange: (jumlah: number) => void;
  onCartUpdate: (cart: CartItem[]) => void;
};

export default function SidebarCart({
  cart,
  kendaraan,
  tanggalBooking,
  waktuBooking,
  jumlahPenumpang,
  visible,
  onClose,
  onRemoveFromCart,
  onKendaraanChange,
  onTanggalChange,
  onWaktuChange,
  onPenumpangChange,
  onCartUpdate,
}: SidebarCartProps) {

  const [nama, setNama] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const totalDestinasi = cart.length;
  const HARGA_PER_DESTINASI = 800000;
  const totalBiaya = totalDestinasi * HARGA_PER_DESTINASI;

  async function handlePesan() {
    if (!nama || cart.length === 0 || !tanggalBooking || !waktuBooking || !kendaraan) {
        setSubmitMessage('Harap lengkapi semua isian: Nama, Destinasi, Tanggal, Waktu, dan Kendaraan.');
        return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    const transactionData = {
      nama,
      destinasi: cart.map(item => item.nama).join(', '),
      penumpang: jumlahPenumpang,
      tanggal_berangkat: tanggalBooking,
      waktu_berangkat: waktuBooking,
      kendaraan: kendaraan,
      total: totalBiaya,
    };

    try {
      const result = await apiService.postTransaction(transactionData);
      setSubmitMessage(`Transaksi berhasil! Kode Booking Anda: ${result.kode}`);
      setNama('');
      onCartUpdate([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      setSubmitMessage(`Gagal: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];
  const maxPassengers = maxPassengersPerVehicle[kendaraan] || 6;

  useEffect(() => {
    if (jumlahPenumpang > maxPassengers) {
      onPenumpangChange(maxPassengers);
    }
  }, [kendaraan, jumlahPenumpang, maxPassengers, onPenumpangChange]);

  if (!visible) {
    return (
      <button
        className="fixed right-4 bottom-4 z-40 bg-[#213DFF] text-white p-4 rounded-full shadow-lg hover:bg-[#16A86E] transition flex items-center justify-center"
        style={{ boxShadow: "0 4px 24px 0 #213DFF22" }}
        onClick={onClose}
        aria-label="Tampilkan Cart"
      >
        <ShoppingCartSimple size={32} />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <aside className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col z-50">
      <header className="flex items-center justify-between p-6 border-b bg-gray-50">
        <h2 className="text-xl font-bold text-[#213DFF]">Keranjang Anda</h2>
        <button
          className="text-[#213DFF] hover:text-[#16A86E] p-2 rounded-lg hover:bg-[#213DFF11] transition"
          onClick={onClose}
          aria-label="Sembunyikan Cart"
        >
          <XSquare size={24} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-2 text-gray-800">Destinasi ({cart.length}/3)</h3>
          {cart.length > 0 ? (
            <ul className="space-y-2">
              {cart.map(item => (
                <li key={item.id} className="flex items-center justify-between bg-[#213DFF11] rounded-xl px-3 py-2 text-sm">
                  <span>{item.nama}</span>
                  <button className="text-red-500 font-bold ml-2 hover:text-red-700" onClick={() => onRemoveFromCart(item.id)}>Hapus</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">Keranjang Anda masih kosong.</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800">Detail Pemesanan</h3>
           <div>
             <label htmlFor="nama-pemesan" className="block text-black/70 mb-1 font-medium">Nama Pemesan</label>
             <input
               type="text"
               id="nama-pemesan"
               value={nama}
               onChange={(e) => setNama(e.target.value)}
               className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base focus:ring-2 focus:ring-[#213DFF]"
               placeholder="Masukkan nama lengkap Anda"
             />
           </div>

          <div>
            <label htmlFor="kendaraan" className="block text-black/70 mb-1 font-medium">Pilih Kendaraan</label>
            <select
              id="kendaraan"
              className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
              value={kendaraan}
              onChange={e => onKendaraanChange(e.target.value)}
            >
              {kendaraanList.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tanggal" className="block text-black/70 mb-1 font-medium">Tanggal</label>
              <input
                type="date"
                id="tanggal"
                className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
                value={tanggalBooking}
                onChange={e => onTanggalChange(e.target.value)}
                min={today}
              />
            </div>
            <div>
              <label htmlFor="waktu" className="block text-black/70 mb-1 font-medium">Waktu</label>
              <input
                type="time"
                id="waktu"
                className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
                value={waktuBooking}
                onChange={e => onWaktuChange(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-black/70 mb-1 font-medium">Jumlah Penumpang</label>
            <div className="flex items-center">
              <button
                className="px-3 py-1 bg-gray-200 rounded-l-lg"
                onClick={() => {
                  if (jumlahPenumpang > 1) {
                    onPenumpangChange(jumlahPenumpang - 1);
                  }
                }}
              >
                -
              </button>
              <input
                type="number"
                className="w-16 text-center border-t border-b border-[#16A86E33]"
                value={jumlahPenumpang}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  if (value >= 1 && value <= maxPassengers) {
                    onPenumpangChange(value);
                  }
                }}
                min="1"
                max={maxPassengers}
              />
              <button
                className="px-3 py-1 bg-gray-200 rounded-r-lg"
                onClick={() => {
                  if (jumlahPenumpang < maxPassengers) {
                    onPenumpangChange(jumlahPenumpang + 1);
                  }
                }}
              >
                +
              </button>
              <span className="ml-3 text-sm text-gray-500">Maks. {maxPassengers}</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="p-6 bg-gray-50 border-t mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-800">Total Biaya</span>
          <span className="text-xl font-extrabold text-[#213DFF]">
            Rp {totalBiaya.toLocaleString("id-ID")}
          </span>
        </div>
        <button
          onClick={handlePesan}
          disabled={isSubmitting || cart.length === 0 || !nama || !tanggalBooking || !waktuBooking}
          className="w-full bg-[#16A86E] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#213DFF] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Memproses...' : 'Pesan Sekarang'}
        </button>
        {submitMessage && (
          <div className={`mt-4 text-center text-sm ${submitMessage.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>
            {submitMessage}
          </div>
        )}
      </footer>
    </aside>
  );
} 