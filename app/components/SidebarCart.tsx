"use client";
import React, { useEffect, useState } from "react";
import { XSquare, FileText, Eye, Translate } from "phosphor-react";
import { CartItem } from "../types";
import { robustApiService } from "../services/robustApi";
import { mutate } from "swr";
import Image from "next/image";
import { useRouter } from "next/navigation";


const packageOptions = [
  {
    key: "Brio",
    label: "Brio",
    harga: 747500,
    fasilitas: ["passengers4", "ac", "driver"],
    maxPassengers: 4,
    image: "/images/brio.jpg",
  },
  {
    key: "Mobilio",
    label: "Mobilio",
    harga: 747500,
    fasilitas: ["passengers4", "ac", "driver", "superComfortable"],
    maxPassengers: 4,
    image: "/images/mobilio.png",
  },
  {
    key: "Innova Reborn",
    label: "Mobil Innova Reborn",
    harga: 1035000,
    fasilitas: ["passengers7", "ac", "driver", "moreComfortable"],
    maxPassengers: 7,
    image: "/images/innova.png",
  },
  {
    key: "HIACE",
    label: "HIACE",
    harga: 1380000,
    fasilitas: ["passengers15", "ac", "driver", "superComfortable"],
    maxPassengers: 15,
    image: "/images/hiace.png",
  },
  {
    key: "Alphard",
    label: "Alphard",
    harga: 3795000,
    fasilitas: ["passengers6", "ac", "driver", "superComfortable"],
    maxPassengers: 6,
    image: "/images/alphard.jpg",
  },
  {
    key: "Pajero",
    label: "Pajero",
    harga: 1725000,
    fasilitas: ["passengers6", "ac", "driver", "superComfortable"],
    maxPassengers: 6,
    image: "/images/pajero.jpg",
  },
  {
    key: "Fortuner",
    label: "Fortuner",
    harga: 1610000,
    fasilitas: ["passengers6", "ac", "driver", "superComfortable"],
    maxPassengers: 6,
    image: "/images/fortuner.jpg",
  },
  {
    key: "Avanza",
    label: "Avanza",
    harga: 805000,
    fasilitas: ["passengers6", "ac", "driver", "superComfortable"],
    maxPassengers: 6,
    image: "/images/avanza.jpg",
  },
  {
    key: "Elf Lonng",
    label: "Elf Long",
    harga: 1380000,
    fasilitas: ["passengers15", "ac", "driver", "superComfortable"],
    maxPassengers: 15,
    image: "/images/elfLong.jpg",
  },
  {
    key: "Bus Medium & Long",
    label: "Bus Medium & Big Bus",
    harga: 2070000,
    fasilitas: ["passengers20", "ac", "driver", "superComfortable"],
    maxPassengers: 20,
    image: "/images/busMedLong.jpg",
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

// Translation object
const translations = {
  id: {
    // Header
    cartTitle: "Keranjang Anda",
    cartSubtitle: "Pesanan akan diproses via WhatsApp",
    hideCart: "Sembunyikan Cart",
    
    // Destinations
    destinations: "Destinasi",
    emptyCart: "Keranjang Anda masih kosong.",
    remove: "Hapus",
    
    // Booking Details
    bookingDetails: "Detail Pemesanan",
    customerName: "Nama Pemesan",
    customerNamePlaceholder: "Masukkan nama lengkap Anda",
    passengerCount: "Jumlah Penumpang",
    maxPassengers: "Maks.",
    selectVehicle: "Pilih Mobil",
    noVehicleAvailable: "Tidak ada kendaraan yang tersedia untuk",
    passengers: "penumpang.",
    maxCapacity: "Maksimal kapasitas:",
    insufficientCapacity: "Kapasitas tidak cukup untuk",
    passengersLabel: "penumpang",
    
    // Date and Time
    date: "Tanggal",
    time: "Waktu",
    
    // Terms and Conditions
    termsText: "Saya telah membaca dan setuju terhadap",
    termsLink: "Syarat dan ketentuan pembelian tiket",
    termsRequired: "Anda harus menyetujui syarat dan ketentuan untuk melanjutkan",
    termsTitle: "Syarat dan Ketentuan Pembelian Tiket",
    termsUnderstand: "Saya Mengerti",
    
    // Cost Breakdown
    destinationsCost: "Destinasi",
    vehicleCost: "Kendaraan",
    totalCost: "Total Biaya",
    
    // Buttons
    bookingNow: "Booking Sekarang",
    processing: "Memproses...",
    confirmWhatsApp: "Konfirmasi ke WhatsApp",
    orderAgain: "Pesan Lagi",
    
    // Messages
    fillAllFields: "Harap lengkapi semua isian: Nama, Destinasi, Tanggal, Waktu, dan Kendaraan.",
    minBookingRule: "Tanggal/Waktu minimal pemesanan adalah",
    minBookingRuleEnd: "(H+3).",
    transactionSuccess: "Transaksi berhasil! Kode Booking:",
    redirectInvoice: "Anda akan diarahkan ke halaman invoice.",
    transactionFailed: "Gagal:",
    errorOccurred: "Terjadi kesalahan",
    
    // Loading
    pleaseWait: "Tunggu Sebentar",
    processingOrder: "Sedang memproses pesanan Anda...",
    
    // Vehicle facilities
    passengers4: "4 penumpang",
    passengers6: "6 penumpang", 
    passengers7: "7 penumpang",
    passengers15: "15 penumpang",
    passengers20: "20 penumpang",
    ac: "AC",
    driver: "Driver",
    superComfortable: "Super nyaman",
    moreComfortable: "Lebih nyaman",
  },
  en: {
    // Header
    cartTitle: "Your Cart",
    cartSubtitle: "Orders will be processed via WhatsApp",
    hideCart: "Hide Cart",
    
    // Destinations
    destinations: "Destinations",
    emptyCart: "Your cart is still empty.",
    remove: "Remove",
    
    // Booking Details
    bookingDetails: "Booking Details",
    customerName: "Customer Name",
    customerNamePlaceholder: "Enter your full name",
    passengerCount: "Number of Passengers",
    maxPassengers: "Max.",
    selectVehicle: "Select Vehicle",
    noVehicleAvailable: "No vehicles available for",
    passengers: "passengers.",
    maxCapacity: "Maximum capacity:",
    insufficientCapacity: "Insufficient capacity for",
    passengersLabel: "passengers",
    
    // Date and Time
    date: "Date",
    time: "Time",
    
    // Terms and Conditions
    termsText: "I have read and agree to the",
    termsLink: "Terms and conditions for ticket purchase",
    termsRequired: "You must agree to the terms and conditions to continue",
    termsTitle: "Terms and Conditions for Ticket Purchase",
    termsUnderstand: "I Understand",
    
    // Cost Breakdown
    destinationsCost: "Destinations",
    vehicleCost: "Vehicle",
    totalCost: "Total Cost",
    
    // Buttons
    bookingNow: "Book Now",
    processing: "Processing...",
    confirmWhatsApp: "Confirm to WhatsApp",
    orderAgain: "Order Again",
    
    // Messages
    fillAllFields: "Please complete all fields: Name, Destinations, Date, Time, and Vehicle.",
    minBookingRule: "Minimum booking date/time is",
    minBookingRuleEnd: "(D+3).",
    transactionSuccess: "Transaction successful! Booking Code:",
    redirectInvoice: "You will be redirected to the invoice page.",
    transactionFailed: "Failed:",
    errorOccurred: "An error occurred",
    
    // Loading
    pleaseWait: "Please Wait",
    processingOrder: "Processing your order...",
    
    // Vehicle facilities
    passengers4: "4 passengers",
    passengers6: "6 passengers",
    passengers7: "7 passengers", 
    passengers15: "15 passengers",
    passengers20: "20 passengers",
    ac: "AC",
    driver: "Driver",
    superComfortable: "Super comfortable",
    moreComfortable: "More comfortable",
  }
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
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  // Translation function
  const t = (key: string) => {
    return translations[language][key as keyof typeof translations.id] || key;
  };

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
        setSubmitMessage(t('fillAllFields'));
        return;
    }

    // Validate H+3 rule
    const selectedDateTime = new Date(`${tanggalBooking}T${waktuBooking}:00`);
    if (selectedDateTime < minDateTime) {
      setSubmitMessage(`${t('minBookingRule')} ${minBookingDate} ${minBookingTime} ${t('minBookingRuleEnd')}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');
    setShowLoadingPopup(true);

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
      cart: cart, // Include detailed cart data for JSON pricing
    };

    console.log('Sending transaction data:', transactionData);
    console.log('Cart items:', cart);

    try {
      // Single API call - transaction data includes destination names for visitor increment
      const result = await robustApiService.createTransaction(transactionData);
      
      // Set success message
      setSubmitMessage(`${t('transactionSuccess')} ${result.kode}. ${t('redirectInvoice')}`);
      
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
      const errorMessage = error instanceof Error ? error.message : t('errorOccurred');
      setSubmitMessage(`${t('transactionFailed')} ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setShowLoadingPopup(false);
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
    <>
      {/* Loading Popup */}
      {showLoadingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#16A86E] mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('pleaseWait')}</h3>
            <p className="text-gray-600">{t('processingOrder')}</p>
          </div>
        </div>
      )}

      <aside className="fixed top-2 right-2 bottom-2 left-2 bg-white shadow-2xl flex flex-col z-50 rounded-2xl">
        <header className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-[#213DFF]">{t('cartTitle')}</h2>
            <p className="text-xs text-gray-600 mt-1">{t('cartSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-[#213DFF] hover:text-[#16A86E] p-2 rounded-lg hover:bg-[#213DFF11] transition"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              aria-label="Toggle Language"
              title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
            >
              <Translate size={20} />
            </button>
            <button
              className="text-[#213DFF] hover:text-[#16A86E] p-2 rounded-lg hover:bg-[#213DFF11] transition"
              onClick={onClose}
              aria-label={t('hideCart')}
            >
              <XSquare size={24} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-800">{t('destinations')} ({cart.length}/3)</h3>
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
                    <button className="text-red-500 font-bold ml-2 hover:text-red-700" onClick={() => onRemoveFromCart(item.id)}>{t('remove')}</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">{t('emptyCart')}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-800">{t('bookingDetails')}</h3>
            <div>
              <label htmlFor="nama-pemesan" className="block text-black/70 mb-1 font-medium">{t('customerName')}</label>
              <input
                type="text"
                id="nama-pemesan"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full rounded-xl px-4 py-2 border border-[#16A86E33] bg-white shadow text-base focus:ring-2 focus:ring-[#213DFF]"
                placeholder={t('customerNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-black/70 mb-1 font-medium">{t('passengerCount')}</label>
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
                <span className="ml-3 text-sm text-gray-500">{t('maxPassengers')} {maxPassengers}</span>
              </div>
            </div>

            {/* Pilihan Paket (Card) */}
            <div>
              <label className="block text-black/70 mb-1 font-medium">{t('selectVehicle')}</label>
              {availableCars.length === 0 && (
                <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm font-medium">
                    ⚠️ {t('noVehicleAvailable')} {jumlahPenumpang} {t('passengers')} 
                    {t('maxCapacity')} {Math.max(...packageOptions.map(p => p.maxPassengers))} {t('passengersLabel')}.
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
                          <li key={f} className="px-2 py-1 rounded-full bg-[#213DFF11] text-[#213DFF] text-xs font-semibold">{t(f)}</li>
                        ))}
                      </ul>
                      {isInsufficient && (
                        <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                          <p className="text-red-700 text-xs">
                            ⚠️ {t('insufficientCapacity')} {jumlahPenumpang} {t('passengersLabel')}
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
                <label htmlFor="tanggal" className="block text-black/70 mb-1 font-medium">{t('date')}</label>
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
                <label htmlFor="waktu" className="block text-black/70 mb-1 font-medium">{t('time')}</label>
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
                {t('termsText')}{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  className="text-[#16A86E] underline hover:text-[#213DFF] font-medium"
                >
                  {t('termsLink')}
                </button>
              </span>
            </label>
            {!termsAccepted && (
              <p className="text-xs text-red-500 mt-2 ml-7">
                {t('termsRequired')}
              </p>
            )}
          </div>

          {/* Terms and Conditions Modal */}
          {showTermsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#213DFF]">{t('termsTitle')}</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowTermsModal(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="prose prose-sm max-w-none">
                    <h2 className="text-lg font-bold text-[#213DFF] mb-4">Syarat dan Ketentuan Layanan Gemitra Jogja</h2>
                    
                    <p className="mb-4">
                      Dokumen Syarat dan Ketentuan ini ("Ketentuan") merupakan perjanjian yang mengikat secara hukum antara Anda ("Pengguna") dengan Gemitra Jogja ("Kami"). Dengan mengakses platform, menggunakan informasi, dan/atau melakukan pemesanan Layanan yang disediakan oleh Gemitra Jogja, Pengguna menyatakan telah membaca, memahami, menyetujui, dan terikat pada seluruh isi Ketentuan ini. Apabila Pengguna tidak menyetujui salah satu, sebagian, atau seluruh isi Ketentuan ini, maka Pengguna tidak diperkenankan untuk menggunakan Layanan kami.
                    </p>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Definisi dan Interpretasi</h3>
                    <p className="mb-2">Untuk memastikan pemahaman yang seragam dan menghindari ambiguitas dalam penafsiran Ketentuan ini, istilah-istilah berikut memiliki pengertian sebagai berikut:</p>
                    
                    <div className="space-y-3 mb-6">
                      <div>
                        <strong>1. Gemitra Jogja</strong> merujuk pada merek usaha dan platform digital yang berfokus pada jasa perjalanan wisata hidden gems di Daerah Istimewa Yogyakarta. Secara hukum, platform ini dioperasikan berdasarkan Nomor Induk Berusaha (NIB) 2407250123172.
                      </div>
                      <div>
                        <strong>2. Platform</strong> adalah situs web resmi Gemitra Jogja yang dapat diakses di alamat https://gemitra.vercel.app/, serta seluruh akun media sosial resmi yang terafiliasi, termasuk akun Instagram @gemitra_jogja.
                      </div>
                      <div>
                        <strong>3. Pengguna</strong> adalah setiap individu, kelompok, atau entitas yang mengakses Platform, menggunakan informasi yang tersedia, dan/atau melakukan pemesanan Layanan yang ditawarkan oleh Gemitra Jogja.
                      </div>
                      <div>
                        <strong>4. Paket Wisata</strong> adalah serangkaian layanan perjalanan yang telah disusun dan ditawarkan dalam satu kesatuan harga, yang mencakup komponen-komponen seperti transportasi, tiket masuk, dan fasilitas lainnya.
                      </div>
                      <div>
                        <strong>5. Mitra Pihak Ketiga</strong> adalah badan usaha atau perorangan independen yang menjalin kerja sama dengan Gemitra Jogja untuk menyediakan komponen-komponen Layanan.
                      </div>
                      <div>
                        <strong>6. Destinasi Hidden Gems</strong> merujuk pada lokasi-lokasi wisata di Daerah Istimewa Yogyakarta yang jarang dikunjungi atau belum banyak diketahui oleh wisatawan.
                      </div>
                      <div>
                        <strong>7. Harga Paket</strong> adalah biaya total yang harus dibayarkan oleh Pengguna untuk satu Paket Wisata yang dipilih.
                      </div>
                    </div>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Ruang Lingkup Layanan</h3>
                    <p className="mb-4">
                      Gemitra Jogja memposisikan diri sebagai "perusahaan digital yang menjembatani jasa pariwisata". Ruang lingkup layanan kami secara fundamental adalah sebagai platform agregator dan penyelenggara tur yang mengintegrasikan berbagai layanan dari Mitra Pihak Ketiga untuk menciptakan pengalaman wisata yang unik dan terkurasi.
                    </p>
                    <p className="mb-4">
                      Layanan utama yang disediakan oleh Gemitra Jogja mencakup:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mb-6">
                      <li><strong>Kurasi dan Promosi:</strong> Melakukan riset, seleksi, dan promosi destinasi "Hidden Gems" di Daerah Istimewa Yogyakarta</li>
                      <li><strong>Penyediaan Paket Wisata:</strong> Merancang dan menawarkan paket perjalanan yang terstruktur (Paket Basic, Lite, dan Premium)</li>
                      <li><strong>Fasilitasi Pemesanan:</strong> Menyediakan sistem pemesanan dan pembayaran yang terpusat melalui situs web resmi</li>
                    </ul>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Paket Wisata dan Inklusi Layanan</h3>
                    <p className="mb-2">Setiap paket wisata Gemitra Jogja secara standar telah mencakup fasilitas-fasilitas berikut:</p>
                    <ul className="list-disc list-inside space-y-1 mb-4">
                      <li><strong>Kendaraan Pribadi:</strong> Penggunaan satu unit kendaraan privat ber-AC yang jenisnya disesuaikan dengan paket yang dipilih</li>
                      <li><strong>Jasa Pengemudi Profesional:</strong> Layanan pengemudi berpengalaman yang memiliki pengetahuan mengenai rute dan destinasi wisata di DIY</li>
                      <li><strong>Biaya Bahan Bakar:</strong> Seluruh biaya bahan bakar untuk perjalanan sesuai dengan rencana perjalanan yang disepakati</li>
                      <li><strong>Biaya Parkir dan Tol:</strong> Seluruh biaya parkir dan tol yang timbul selama pelaksanaan rencana perjalanan</li>
                    </ul>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Prosedur Pemesanan dan Pembayaran</h3>
                    <div className="space-y-2 mb-6">
                      <div><strong>1. Proses Pemesanan:</strong> Semua pemesanan Layanan harus dilakukan melalui situs web https://gemitra.vercel.app/</div>
                      <div><strong>2. Data Pengguna:</strong> Pengguna wajib mengisi dan memberikan data yang akurat, valid, dan dapat dipertanggungjawabkan</div>
                      <div><strong>3. Konfirmasi Pemesanan:</strong> Pemesanan dianggap sah setelah pembayaran penuh diterima dan bukti konfirmasi resmi diterbitkan</div>
                      <div><strong>4. Harga:</strong> Harga yang mengikat Pengguna adalah harga yang tercantum pada saat pembayaran berhasil dikonfirmasi</div>
                      <div><strong>5. Metode Pembayaran:</strong> Metode pembayaran yang diterima akan diinformasikan pada tahap akhir proses pemesanan</div>
                    </div>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Hak dan Kewajiban Pengguna</h3>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Kewajiban Pengguna:</h4>
                      <ol className="list-decimal list-inside space-y-1 mb-4">
                        <li>Memberikan informasi identitas diri dan detail pemesanan yang benar, akurat, dan lengkap</li>
                        <li>Melakukan pembayaran sesuai dengan jumlah total dan batas waktu yang telah ditentukan</li>
                        <li>Menaati jadwal perjalanan (itinerary) dan waktu yang telah disepakati</li>
                        <li>Menjaga etika, kesopanan, dan menghormati adat istiadat serta budaya lokal</li>
                        <li>Bertanggung jawab penuh atas barang bawaan pribadi</li>
                        <li>Menjaga kebersihan dan keutuhan fasilitas yang disediakan</li>
                      </ol>
                    </div>
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Hak Pengguna:</h4>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Menerima Layanan sesuai dengan deskripsi Paket Wisata yang telah dipilih dan dikonfirmasi</li>
                        <li>Mendapatkan informasi yang jelas dan relevan mengenai detail perjalanan</li>
                        <li>Mendapatkan perlakuan yang profesional dan sopan dari tim Gemitra Jogja</li>
                      </ol>
                    </div>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Kebijakan Pembatalan dan Pengembalian Dana</h3>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Pembatalan oleh Pengguna:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>Pembatalan lebih dari 30 hari:</strong> Pengembalian dana sebesar 100%</li>
                        <li><strong>Pembatalan 15-29 hari:</strong> Pengembalian dana sebesar 50%</li>
                        <li><strong>Pembatalan kurang dari 14 hari:</strong> Tidak ada pengembalian dana</li>
                        <li><strong>No-Show:</strong> Tidak ada pengembalian dana</li>
                      </ul>
                    </div>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Batasan Tanggung Jawab</h3>
                    <p className="mb-4">
                      Gemitra Jogja beroperasi sebagai agen atau perantara yang menghubungkan Pengguna dengan layanan yang disediakan oleh Mitra Pihak Ketiga. Tanggung jawab utama atas kualitas, keamanan, dan kelayakan operasional dari setiap komponen layanan berada pada Mitra Pihak Ketiga yang bersangkutan.
                    </p>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Kebijakan Privasi</h3>
                    <p className="mb-4">
                      Gemitra Jogja berkomitmen untuk melindungi privasi data pribadi Pengguna. Data pribadi akan digunakan untuk pemrosesan pemesanan, komunikasi terkait layanan, dan keperluan administrasi internal. Data tidak akan dibagikan kepada pihak ketiga tanpa kepentingan langsung.
                    </p>

                    <h3 className="text-md font-bold text-[#16A86E] mb-3">Kontak</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="mb-2"><strong>Email:</strong> gemitrayogyakarta@gmail.com</p>
                      <p className="mb-2"><strong>Website:</strong> https://gemitra.vercel.app/</p>
                      <p className="mb-2"><strong>Instagram:</strong> @gemitra_jogja</p>
                    </div>

                    <p className="mt-6 text-sm text-gray-600">
                      <strong>Tanggal Efektif:</strong> Dokumen ini berlaku efektif sejak tanggal diterbitkan.
                    </p>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex-shrink-0">
                  <button
                    onClick={() => setShowTermsModal(false)}
                    className="w-full bg-[#16A86E] text-white font-bold py-3 rounded-xl hover:bg-[#213DFF] transition"
                  >
                    {t('termsUnderstand')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="mb-4 space-y-2">
            {cart.length > 0 && destinationTotal > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{t('destinationsCost')} ({cart.length})</span>
                <span className="text-gray-800">Rp {destinationTotal.toLocaleString("id-ID")}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{t('vehicleCost')} ({selectedPackage.label})</span>
              <span className="text-gray-800">Rp {carPrice.toLocaleString("id-ID")}</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">{t('totalCost')}</span>
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
                t('processing')
              ) : (
                <>
                  <span>📱</span>
                  {t('bookingNow')}
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
                {t('confirmWhatsApp')}
              </a>
              <button
                onClick={() => {
                  setWhatsappUrl(null);
                  setSubmitMessage('');
                }}
                className="w-full bg-gray-500 text-white font-bold py-2 rounded-xl shadow-lg hover:bg-gray-600 transition"
              >
                {t('orderAgain')}
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
    </>
  );
} 
