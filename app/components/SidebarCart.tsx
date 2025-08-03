"use client";
import React, { useEffect, useState } from "react";
import { XSquare } from "phosphor-react";
import { CartItem } from "../types";
import { apiService } from "../services/api";
import { mutate } from "swr";
import Image from "next/image";


const packageOptions = [
  {
    key: "Mobil Brio",
    label: "Mobil Brio",
    harga: 920000,
    fasilitas: ["4 penumpang", "AC", "Driver"],
    maxPassengers: 4,
    image: "/images/mobilio.png",
  },
  {
    key: "Mobil Innova Reborn",
    label: "Mobil Innova Reborn",
    harga: 1320000,
    fasilitas: ["6 penumpang", "AC", "Driver", "Lebih nyaman"],
    maxPassengers: 6,
    image: "/images/innova.png",
  },
  {
    key: "HIACE",
    label: "HIACE",
    harga: 1720000,
    fasilitas: ["11 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 11,
    image: "/images/hiace.png",
  },
];

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
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  // Calculate destination prices
  const destinationTotal = cart.reduce((sum, item) => sum + (item.harga || 0), 0);
  
  // Filter cars based on passenger capacity
  const availableCars = packageOptions.filter(car => car.maxPassengers >= jumlahPenumpang);
  
  // Get selected car, ensuring it has sufficient capacity
  const selectedPackage = packageOptions.find(p => p.key === kendaraan) || packageOptions[0];
  const currentCarIsValid = selectedPackage.maxPassengers >= jumlahPenumpang;
  
  // Use selected car if valid, otherwise use first available
  const finalSelectedPackage = currentCarIsValid ? selectedPackage : (availableCars[0] || packageOptions[0]);
  
  const carPrice = finalSelectedPackage.harga;
  const totalBiaya = destinationTotal + carPrice;
  const maxPassengers = finalSelectedPackage.maxPassengers;

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
      destinasi_harga: cart.map(item => item.harga || 0),
      penumpang: jumlahPenumpang,
      tanggal_berangkat: tanggalBooking,
      waktu_berangkat: waktuBooking,
      kendaraan: kendaraan,
      kendaraan_harga: carPrice,
      total: totalBiaya,
    };

    try {
      // Single API call - transaction data includes destination names for visitor increment
      const result = await apiService.createTransaction(transactionData);
      
      // Generate WhatsApp message
      const whatsappMessage = `Halo! Saya ingin memesan paket wisata dengan detail berikut:

*Detail Pemesanan:*
👤 Nama: ${nama}
🗺️ Destinasi: ${cart.map(item => item.nama).join(', ')}
👥 Jumlah Penumpang: ${jumlahPenumpang} orang
🚗 Kendaraan: ${kendaraan}
📅 Tanggal Berangkat: ${tanggalBooking}
⏰ Waktu: ${waktuBooking}
💰 Total Biaya: Rp ${totalBiaya.toLocaleString("id-ID")}

*Kode Invoice: ${result.kode}*

Mohon informasi lebih lanjut untuk proses pembayaran. Terima kasih! 🙏`;

      // Encode message for WhatsApp URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const whatsappUrl = `https://wa.me/6289606883082?text=${encodedMessage}`;
      
      // Set success message
      setSubmitMessage(`Transaksi berhasil! Kode Booking: ${result.kode}. Silakan klik tombol WhatsApp di bawah.`);
      setNama('');
      onCartUpdate([]);
      
      // Clear destinations cache to force refresh (since visitor count changed)
      localStorage.removeItem('gemitra_destinations_cache');
      localStorage.removeItem('gemitra_destinations_timestamp');
      
      // Trigger SWR revalidation for destinations
      mutate('/api/destinations');
      mutate('/api/destinations?limit=6');
      
      // Store WhatsApp URL in state for the anchor link
      setWhatsappUrl(whatsappUrl);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
      setSubmitMessage(`Gagal: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (jumlahPenumpang > maxPassengers) {
      onPenumpangChange(maxPassengers);
    }
  }, [kendaraan, jumlahPenumpang, maxPassengers, onPenumpangChange]);

  // Auto-select appropriate car only when current car becomes insufficient
  useEffect(() => {
    const currentCar = packageOptions.find(car => car.key === kendaraan);
    if (currentCar && currentCar.maxPassengers < jumlahPenumpang) {
      // Current car is insufficient, find a suitable replacement
      const suitableCar = availableCars.find(car => car.maxPassengers >= jumlahPenumpang);
      if (suitableCar && suitableCar.key !== kendaraan) {
        onKendaraanChange(suitableCar.key);

      }
    }
  }, [jumlahPenumpang, kendaraan, availableCars, onKendaraanChange]);



  if (!visible) {
    return null;
  }

  return (
    <aside className="fixed top-2 right-2 bottom-2 left-2 bg-white shadow-2xl flex flex-col z-50 rounded-2xl">
      <header className="flex items-center justify-between p-6 border-b bg-gray-50">
        <div>
          <h2 className="text-xl font-bold text-[#213DFF]">Keranjang Anda</h2>
          <p className="text-xs text-gray-600 mt-1">Pesanan akan diproses via WhatsApp</p>
        </div>
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
                  <div className="flex-1">
                    <span className="font-medium">{item.nama}</span>
                    {item.harga && (
                      <span className="block text-xs text-gray-600">
                        Rp {item.harga.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
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

          {/* Pilihan Paket (Card) */}
          <div>
            <label className="block text-black/70 mb-1 font-medium">Pilih Mobil</label>
            {availableCars.length === 0 && (
              <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm font-medium">
                  ⚠️ Tidak ada kendaraan yang tersedia untuk {jumlahPenumpang} penumpang. 
                  Maksimal kapasitas: {Math.max(...packageOptions.map(p => p.maxPassengers))} penumpang.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {packageOptions.map(pkg => {
                const isAvailable = pkg.maxPassengers >= jumlahPenumpang;
                const isSelected = kendaraan === pkg.key;
                const isInsufficient = !isAvailable && isSelected;
                
                return (
                  <button
                    key={pkg.key}
                    type="button"
                    onClick={() => {
                      if (isAvailable) {
                        onKendaraanChange(pkg.key);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition flex flex-col gap-2 shadow-sm
                      ${isSelected ? 'border-[#213DFF] bg-[#213DFF08]' : 'border-[#16A86E22] bg-white'}
                      ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image 
                          src={pkg.image} 
                          alt={pkg.label}
                          className="w-24 h-12 object-cover rounded-lg"
                          width={200}
                          height={200}
                        />
                        <span className="font-bold text-sm md:text-base text-[#213DFF]">{pkg.label}</span>
                      </div>
                      <span className="font-bold text-sm md:text-base text-[#16A86E]">Rp {pkg.harga.toLocaleString("id-ID")}</span>
                    </div>
                    <ul className="flex flex-wrap gap-1 mt-1">
                      {pkg.fasilitas.map(f => (
                        <li key={f} className="px-2 py-1 rounded-full bg-[#213DFF11] text-[#213DFF] text-xs font-semibold">{f}</li>
                      ))}
                    </ul>
                    {isInsufficient && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-red-700 text-xs">
                          ⚠️ Kapasitas tidak cukup untuk {jumlahPenumpang} penumpang
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
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
        {/* Cost Breakdown */}
        <div className="mb-4 space-y-2">
          {cart.length > 0 && destinationTotal > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Destinasi ({cart.length})</span>
              <span className="text-gray-800">Rp {destinationTotal.toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Kendaraan ({selectedPackage.label})</span>
            <span className="text-gray-800">Rp {carPrice.toLocaleString("id-ID")}</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total Biaya</span>
            <span className="text-xl font-extrabold text-[#213DFF]">
              Rp {totalBiaya.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        {!whatsappUrl ? (
          <button
            onClick={handlePesan}
            disabled={isSubmitting || cart.length === 0 || !nama || !tanggalBooking || !waktuBooking}
            className="w-full bg-[#16A86E] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#213DFF] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              'Memproses...'
            ) : (
              <>
                <span>📱</span>
                Booking Sekarang
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl shadow-lg hover:bg-[#128C7E] transition flex items-center justify-center gap-2"
            >
              <span>📱</span>
              Konfirmasi ke WhatsApp
            </a>
            <button
              onClick={() => {
                setWhatsappUrl(null);
                setSubmitMessage('');
              }}
              className="w-full bg-gray-500 text-white font-bold py-2 rounded-xl shadow-lg hover:bg-gray-600 transition"
            >
              Pesan Lagi
            </button>
          </div>
        )}
        {submitMessage && (
          <div className={`mt-4 text-center text-sm ${submitMessage.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>
            {submitMessage}
          </div>
        )}
      </footer>
    </aside>
  );
} 