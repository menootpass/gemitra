"use client";
import React, { useEffect, useState } from "react";
import { XSquare } from "phosphor-react";
import { CartItem } from "../types";
import { apiService } from "../services/api";
import { mutate } from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";


const packageOptions = [
  {
    key: "Brio",
    label: "Brio",
    harga: 747500,
    fasilitas: ["4 penumpang", "AC", "Driver"],
    maxPassengers: 4,
    image: "/images/mobilio.png",
  },
  {
    key: "Mobilio",
    label: "Mobilio",
    harga: 747500,
    fasilitas: ["4 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 4,
    image: "/images/hiace.png",
  },
  {
    key: "Innova Reborn",
    label: "Mobil Innova Reborn",
    harga: 1035000,
    fasilitas: ["7 penumpang", "AC", "Driver", "Lebih nyaman"],
    maxPassengers: 7,
    image: "/images/innova.png",
  },
  {
    key: "HIACE",
    label: "HIACE",
    harga: 1380000,
    fasilitas: ["15 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 15,
    image: "/images/hiace.png",
  },
  {
    key: "Alphard",
    label: "Alphard",
    harga: 3795000,
    fasilitas: ["6 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 6,
    image: "/images/hiace.png",
  },
  {
    key: "Pajero",
    label: "Pajero",
    harga: 1725000,
    fasilitas: ["6 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 6,
    image: "/images/hiace.png",
  },
  {
    key: "Fortuner",
    label: "Fortuner",
    harga: 1610000,
    fasilitas: ["6 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 6,
    image: "/images/hiace.png",
  },
  {
    key: "Avanza",
    label: "Avanza",
    harga: 805000,
    fasilitas: ["6 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 6,
    image: "/images/hiace.png",
  },
  {
    key: "Elf Lonng",
    label: "Elf Long",
    harga: 1380000,
    fasilitas: ["15 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 15,
    image: "/images/hiace.png",
  },
  {
    key: "Bus Medium & Long",
    label: "Bus Medium & Big Bus",
    harga: 2070000,
    fasilitas: ["20 penumpang", "AC", "Driver", "Super nyaman"],
    maxPassengers: 20,
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

  const router = useRouter();
  const [nama, setNama] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Min booking datetime: now + 3 days
  const now = new Date();
  const minDateTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const formatDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const formatTime = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const minBookingDate = formatDate(minDateTime);
  const minBookingTime = formatTime(minDateTime);
  const isOnMinDate = tanggalBooking === minBookingDate;
  
  // Calculate destination prices (price × number of passengers)
  const destinationTotal = cart.reduce((sum, item) => sum + ((item.harga || 0) * jumlahPenumpang), 0);
  
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

    // Validate H+3 rule
    const selectedDateTime = new Date(`${tanggalBooking}T${waktuBooking}:00`);
    if (selectedDateTime < minDateTime) {
      setSubmitMessage(`Tanggal/Waktu minimal pemesanan adalah ${minBookingDate} ${minBookingTime} (H+3).`);
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
      
      // Set success message
      setSubmitMessage(`Transaksi berhasil! Kode Booking: ${result.kode}. Anda akan diarahkan ke halaman invoice.`);
      
      // Clear form and cart
      setNama('');
      onCartUpdate([]);
      
      // Clear destinations cache to force refresh (since visitor count changed)
      localStorage.removeItem('gemitra_destinations_cache');
      localStorage.removeItem('gemitra_destinations_timestamp');
      
      // Trigger SWR revalidation for destinations
      mutate('/api/destinations');
      mutate('/api/destinations?limit=6');
      
      // Close sidebar
      onClose();
      
      // Redirect to invoice page after a short delay
      setTimeout(() => {
        router.push(`/invoice/${result.kode}`);
      }, 1500);
      
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
                onChange={e => {
                  const value = e.target.value;
                  if (value && value < minBookingDate) {
                    onTanggalChange(minBookingDate);
                    // If moving to min date and current time earlier than min, adjust time as well
                    if (!waktuBooking || waktuBooking < minBookingTime) {
                      onWaktuChange(minBookingTime);
                    }
                  } else {
                    onTanggalChange(value);
                    // If picking min date, ensure time respects min time
                    if (value === minBookingDate && waktuBooking && waktuBooking < minBookingTime) {
                      onWaktuChange(minBookingTime);
                    }
                  }
                }}
                min={minBookingDate}
              />
            </div>
            <div>
              <label htmlFor="waktu" className="block text-black/70 mb-1 font-medium">Waktu</label>
              <input
                type="time"
                id="waktu"
                className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base"
                value={waktuBooking}
                onChange={e => {
                  const value = e.target.value;
                  if (isOnMinDate && value < minBookingTime) {
                    onWaktuChange(minBookingTime);
                  } else {
                    onWaktuChange(value);
                  }
                }}
                min={isOnMinDate ? minBookingTime : undefined}
              />
            </div>
          </div>
          
        </div>
      </div>

      <footer className="p-6 bg-gray-50 border-t mt-auto">
        {/* Syarat dan ketentuan */}
        <div className="mb-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#16A86E] bg-white border-2 border-[#16A86E] rounded focus:ring-[#16A86E] focus:ring-2"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              Saya telah membaca dan setuju terhadap{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="text-[#16A86E] underline hover:text-[#213DFF] font-medium"
              >
                Syarat dan ketentuan pembelian tiket
              </button>
            </span>
          </label>
          {!termsAccepted && (
            <p className="text-xs text-red-500 mt-2 ml-7">
              Anda harus menyetujui syarat dan ketentuan untuk melanjutkan
            </p>
          )}
        </div>

        {/* Terms and Conditions Modal */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-opacity-100 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#213DFF]">Syarat dan Ketentuan Pembelian Tiket</h3>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 text-sm text-gray-700 leading-relaxed">
                <div>
                  <h4 className="font-bold text-[#16A86E] mb-2">1. Ketentuan Umum</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Pembelian tiket melalui Gemitra mengikat pelanggan untuk mematuhi semua syarat dan ketentuan yang berlaku.</li>
                    <li>Gemitra berhak mengubah syarat dan ketentuan tanpa pemberitahuan terlebih dahulu.</li>
                    <li>Dengan melakukan pembelian, pelanggan menyetujui semua ketentuan yang berlaku.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#16A86E] mb-2">2. Ketentuan Pembayaran</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Pembayaran dilakukan melalui transfer bank atau metode pembayaran yang disediakan.</li>
                    <li>Konfirmasi pembayaran harus dilakukan maksimal 24 jam setelah pemesanan.</li>
                    <li>Pemesanan akan dibatalkan otomatis jika pembayaran tidak dikonfirmasi dalam waktu yang ditentukan.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#16A86E] mb-2">3. Ketentuan Pembatalan</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Pembatalan dapat dilakukan maksimal 48 jam sebelum tanggal keberangkatan.</li>
                    <li>Biaya pembatalan sebesar 25% dari total biaya pemesanan.</li>
                    <li>Pembatalan kurang dari 48 jam tidak dapat dikembalikan.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#16A86E] mb-2">4. Ketentuan Perjalanan</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Pelanggan wajib membawa identitas asli (KTP/SIM/Paspor).</li>
                    <li>Keberangkatan tepat waktu sesuai jadwal yang telah ditentukan.</li>
                    <li>Gemitra tidak bertanggung jawab atas keterlambatan akibat faktor cuaca atau bencana alam.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#16A86E] mb-2">5. Ketentuan Kendaraan</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Kapasitas kendaraan sesuai dengan paket yang dipilih.</li>
                    <li>Dilarang membawa barang berbahaya atau melanggar hukum.</li>
                    <li>Merokok dan konsumsi alkohol dilarang di dalam kendaraan.</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-bold text-[#16A86E] mb-2">6. Tanggung Jawab</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Gemitra bertanggung jawab atas keselamatan perjalanan sesuai standar keselamatan yang berlaku.</li>
                    <li>Pelanggan bertanggung jawab atas barang bawaan dan dokumen pribadi.</li>
                    <li>Gemitra tidak bertanggung jawab atas kehilangan barang berharga yang tidak disimpan dengan aman.</li>
                  </ul>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="w-full bg-[#16A86E] text-white font-bold py-3 rounded-xl hover:bg-[#213DFF] transition"
                >
                  Saya Mengerti
                </button>
              </div>
            </div>
          </div>
        )}

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
            disabled={isSubmitting || cart.length === 0 || !nama || !tanggalBooking || !waktuBooking || !termsAccepted}
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