'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPrice } from '../../utils/priceUtils';

// --- Tipe Data untuk Invoice ---
type InvoiceData = {
  nama: string;
  destinasi: string;
  penumpang: number;
  tanggal_berangkat: string;
  waktu_berangkat: string;
  kendaraan: string;
  total: number | string;
  status: 'Lunas' | 'Pending' | 'Batal' | 'pending' | 'lunas' | 'batal' | 'success' | 'cancel';
  kode: string;
  waktu_transaksi: string;
  tanggal_transaksi: string;
  rincian_destinasi: string;
  rincian_mobil: number;
};

// --- Tipe Data untuk Item Destinasi ---
type DestinationItem = {
  slug: string;
  harga: number;
  nama: string;
  mancanegara?: number;
};

function parseNumericValue(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (!digitsOnly) return null;
    const parsed = Number(digitsOnly);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

// --- Fungsi untuk Normalisasi Status ---
function normalizeStatus(status: string): 'paid' | 'pending' | 'cancelled' {
  const statusLower = status.toLowerCase();
  
  // Status yang berarti sudah terbayar
  if (statusLower === 'success' || statusLower === 'lunas' || statusLower === 'paid') {
    return 'paid';
  }
  
  // Status yang berarti dibatalkan
  if (statusLower === 'cancel' || statusLower === 'batal' || statusLower === 'cancelled') {
    return 'cancelled';
  }
  
  // Default: pending (belum terbayar)
  return 'pending';
}

// --- Fungsi untuk Parse Rincian Destinasi ---
function parseRincianDestinasi(rincianDestinasi: string): DestinationItem[] {
  if (!rincianDestinasi) {
    console.warn('⚠️ Rincian destinasi kosong');
    return [];
  }

  try {
    let destinationPricing: Record<string, string> = {};
    
    try {
      destinationPricing = JSON.parse(rincianDestinasi);
    } catch (jsonError) {
      // Fallback: parse sebagai string comma-separated
      const destinations = rincianDestinasi.split(',').map(item => item.trim());
      
      destinations.forEach(dest => {
        const [slug, hargaStr] = dest.split(':').map(part => part.trim());
        if (slug && hargaStr) {
          destinationPricing[slug] = hargaStr;
        }
      });
    }
    
    const parsedDestinations: DestinationItem[] = [];
    
    Object.entries(destinationPricing).forEach(([slug, hargaStr]) => {
      const harga = parseInt(hargaStr);
      if (!isNaN(harga)) {
        const nama = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
          .replace(/\(/g, ' (')
          .replace(/\)/g, ') ');
        
        parsedDestinations.push({
          slug,
          harga,
          nama,
          mancanegara: 1.20 // Default international price
        });
        
      } else {
        console.warn(`⚠️ Harga invalid untuk destinasi ${slug}: ${hargaStr}`);
      }
    });
    
    return parsedDestinations;
    
  } catch (error) {
    console.error('❌ Error parsing rincian destinasi:', error);
    return [];
  }
}

// --- Komponen QR Code Generator ---
function QRCodeGenerator({ message }: { message: string }) {
  const [qrCodeError, setQrCodeError] = React.useState(false);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/6285701834668?text=${encodedMessage}`;
  
  // Buat URL QR code yang lebih pendek dengan parameter yang lebih sederhana
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=png&data=${encodeURIComponent(whatsappUrl)}`;
  
  return (
    <div className="text-center">
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {!qrCodeError ? (
          <Image 
            src={qrCodeUrl} 
            alt="QR Code - Scan to open WhatsApp" 
            className="mx-auto mb-2 rounded cursor-pointer hover:opacity-90 transition-opacity border border-green-300" 
            width={150}
            height={150}
            onError={() => {
              console.error('QR Code failed to load');
              setQrCodeError(true);
            }}
          />
        ) : (
          <div className="w-[150px] h-[150px] mx-auto mb-2 rounded border border-green-300 bg-green-50 flex flex-col items-center justify-center">
            <div className="text-green-600 text-2xl mb-1">📱</div>
            <div className="text-green-800 text-xs font-semibold text-center px-2">
              QR Code tidak bisa dimuat
            </div>
            <div className="text-green-600 text-xs">
              Klik untuk WhatsApp
            </div>
          </div>
        )}
      </a>
    </div>
  );
}

// --- Komponen Utama Invoice ---
export default function InvoiceClient({ invoice }: { invoice: InvoiceData }) {
  const { locale, dictionary } = useLanguage();
  
  // Normalisasi status
  const normalizedStatus = normalizeStatus(invoice.status);
  
  // Parse destinasi dari rincian
  const destinasiItems = parseRincianDestinasi(invoice.rincian_destinasi || '');
  
  // Harga mobil dari database
  const hargaMobil = invoice.rincian_mobil || 0;
  
  // Fungsi untuk mendapatkan harga mancanegara berdasarkan nama kendaraan
  const getVehicleInternationalPrice = (vehicleName: string, localPrice: number) => {
    const vehiclePrices: { [key: string]: number } = {
      'Brio': 50,
      'Mobilio': 50,
      'Innova Reborn': 70,
      'HIACE': 90,
      'Alphard': 250,
      'Pajero': 115,
      'Fortuner': 110,
      'Avanza': 55,
      'Elf Long': 90,
      'Elf Lonng': 90,
      'Bus Medium & Long': 140,
      'Bus Medium & Big Bus': 140
    };
    
    // Cari harga mancanegara berdasarkan nama kendaraan
    for (const [key, price] of Object.entries(vehiclePrices)) {
      if (vehicleName.toLowerCase().includes(key.toLowerCase())) {
        return price;
      }
    }
    
    // Fallback: konversi dari IDR ke USD dengan rate 1 USD = 15,000 IDR
    return Math.round(localPrice / 15000);
  };

  // Fungsi untuk mendapatkan harga destinasi mancanegara
  const getDestinationInternationalPrice = (destinationName: string) => {
    // Harga mancanegara untuk destinasi populer
    const destinationPrices: { [key: string]: number } = {
      'batu-alien': 1.20,
      'museum-ullen-sentalu': 1.20,
      'plunyon-kalikuning': 1.20,
      'candi-borobudur': 1.20,
      'candi-prambanan': 1.20,
      'gunung-bromo': 1.20,
      'pantai-parangtritis': 1.20,
      'malioboro': 1.20
    };
    
    // Cari berdasarkan slug
    for (const [slug, price] of Object.entries(destinationPrices)) {
      if (destinationName.toLowerCase().includes(slug)) {
        return price;
      }
    }
    
    // Default price
    return 1.20;
  };

  const fallbackTotalIDR = React.useMemo(() => {
    let totalDestinations = 0;
    destinasiItems.forEach(item => {
      totalDestinations += item.harga || 0;
    });
    return totalDestinations + hargaMobil;
  }, [destinasiItems, hargaMobil]);

  const invoiceTotalIDR = React.useMemo(() => {
    const parsed = parseNumericValue(invoice.total);
    return parsed !== null ? parsed : fallbackTotalIDR;
  }, [invoice.total, fallbackTotalIDR]);

  const totalInternational = React.useMemo(() => {
    let totalDestinations = 0;
    destinasiItems.forEach(item => {
      totalDestinations += getDestinationInternationalPrice(item.slug);
    });
    const vehicleTotal = getVehicleInternationalPrice(invoice.kendaraan, hargaMobil);
    return Number((totalDestinations + vehicleTotal).toFixed(2));
  }, [destinasiItems, invoice.kendaraan, hargaMobil]);

  const totalDisplay = React.useMemo(() => {
    return locale === 'en' ? totalInternational : invoiceTotalIDR;
  }, [locale, totalInternational, invoiceTotalIDR]);

  // Format tanggal
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format waktu
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  // Status styling
  const getStatusStyle = (status: 'paid' | 'pending' | 'cancelled') => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Status text
  const getStatusText = (status: 'paid' | 'pending' | 'cancelled') => {
    switch (status) {
      case 'paid':
        return locale === 'id' ? 'LUNAS' : 'PAID';
      case 'pending':
        return locale === 'id' ? 'MENUNGGU PEMBAYARAN' : 'PENDING';
      case 'cancelled':
        return locale === 'id' ? 'DIBATALKAN' : 'CANCELLED';
      default:
        return 'UNKNOWN';
    }
  };

  // Pesan WhatsApp
  const whatsappMessage = `Halo! Saya ingin konfirmasi pembayaran untuk invoice ${invoice.kode}. Nama: ${invoice.nama}, Destinasi: ${invoice.destinasi}, Tanggal: ${formatDate(invoice.tanggal_berangkat)}. Terima kasih!`;

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4">
      <div className="max-w-sm mx-auto">
        {/* Struk Header */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 shadow-lg p-4 mb-3 border border-green-200">
          <div className="text-center border-b-2 border-dashed border-green-300 pb-3 mb-3">
            {/* Logo dengan ikon */}
            <div className="flex items-center justify-center mb-2">
              <div className="bg-green-100 rounded-full p-2 mr-2">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                GEMITRA JOGJA
              </h1>
            </div>
            
            <p className="text-xs text-gray-600 mb-1">
              🧳 Tour & Travel Service
            </p>
            <p className="text-xs text-gray-500 mb-1">
              🌐 gemitra.com
            </p>
            <p className="text-xs text-gray-500">
              📞 +62 857-0183-4668
            </p>
          </div>
          
          <div className="text-center">
            {/* Invoice dengan ikon */}
            <div className="flex items-center justify-center mb-2">
              <div className="bg-blue-100 rounded-full p-1 mr-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-800">
                INVOICE
              </div>
            </div>
            
            <div className="text-xs font-semibold text-[#16A86E] mb-2">
              #{invoice.kode}
            </div>
            
            {/* Status dengan ikon */}
            <div className={`inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full ${getStatusStyle(normalizedStatus)}`}>
              {normalizedStatus === 'paid' && (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {normalizedStatus === 'pending' && (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {normalizedStatus === 'cancelled' && (
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {getStatusText(normalizedStatus)}
            </div>
          </div>
        </div>

        {/* Struk Detail */}
        <div className="bg-white shadow-lg p-4 mb-3 border border-gray-200">
          {/* Header dengan ikon */}
          <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
            <div className="bg-blue-100 rounded-full p-1 mr-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-xs font-semibold text-gray-800">INFORMASI TRANSAKSI</div>
          </div>

          {/* Tanggal dan waktu dengan ikon */}
          <div className="bg-gray-50 rounded-lg p-2 mb-3">
            <div className="flex justify-between text-xs mb-1">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">Tanggal:</span>
              </div>
              <span className="font-semibold">{formatDate(invoice.tanggal_transaksi)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Waktu:</span>
              </div>
              <span className="font-semibold">{invoice.waktu_transaksi}</span>
            </div>
          </div>

          {/* Detail pesanan dengan ikon */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-gray-600">Nama:</span>
              </div>
              <span className="font-semibold text-right max-w-[60%] break-words">{invoice.nama}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-gray-600">Penumpang:</span>
              </div>
              <span className="font-semibold">{invoice.penumpang} org</span>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-gray-600">Destinasi:</span>
              </div>
              <span className="font-semibold text-right max-w-[60%] break-words">{invoice.destinasi}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-600">Tanggal Tour:</span>
              </div>
              <span className="font-semibold">{formatDate(invoice.tanggal_berangkat)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Waktu Berangkat:</span>
              </div>
              <span className="font-semibold">{formatTime(invoice.waktu_berangkat)}</span>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-gray-600">Kendaraan:</span>
              </div>
              <span className="font-semibold text-right max-w-[60%] break-words">{invoice.kendaraan}</span>
            </div>
          </div>
        </div>

        {/* Struk Item */}
        <div className="bg-white shadow-lg p-4 mb-3 border border-gray-200">
          {/* Header dengan ikon */}
          <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
            <div className="bg-green-100 rounded-full p-1 mr-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-xs font-semibold text-gray-800">RINCIAN PEMBAYARAN</div>
          </div>
          
          <div className="space-y-2 text-xs">
            {/* Destinations dengan ikon */}
            {destinasiItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-1">
                <div className="flex items-center max-w-[60%]">
                  <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-600 break-words">{item.nama}</span>
                </div>
                <span className="font-semibold text-green-600">
                {formatPrice(
                  locale === 'en' ? getDestinationInternationalPrice(item.slug) : item.harga,
                  locale
                )}
                </span>
              </div>
            ))}
            
            {/* Vehicle dengan ikon */}
            <div className="flex justify-between items-center py-1 border-t border-gray-100 pt-2">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-gray-600">Kendaraan</span>
              </div>
              <span className="font-semibold text-blue-600">
                {formatPrice(
                  locale === 'en' ? getVehicleInternationalPrice(invoice.kendaraan, hargaMobil) : hargaMobil,
                  locale
                )}
              </span>
            </div>
          </div>
          
          {/* Total dengan styling yang lebih menarik */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mt-3 border border-green-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-sm font-bold text-gray-800">TOTAL:</span>
              </div>
              <span className="text-lg font-bold text-[#16A86E]">
                {formatPrice(totalDisplay, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Struk Payment */}
        <div className="bg-white shadow-lg p-4 mb-3 border border-gray-200">
          {/* Header dengan ikon */}
          <div className="flex items-center mb-3 pb-2 border-b border-gray-200">
            <div className="bg-purple-100 rounded-full p-1 mr-2">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="text-xs font-semibold text-gray-800">METODE PEMBAYARAN</div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-gray-600">Total:</span>
              </div>
              <span className="font-semibold">
                {formatPrice(totalDisplay, locale)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-gray-600">Bayar:</span>
              </div>
              <span className="font-semibold text-green-600">
                {formatPrice(totalDisplay, locale)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="text-gray-600">Kembalian:</span>
              </div>
              <span className="font-semibold text-blue-600">
                {formatPrice(0, locale)}
              </span>
            </div>
          </div>
          
          {/* Status pembayaran */}
          <div className="mt-3 bg-gray-50 rounded-lg p-2 border border-gray-200">
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-gray-600 font-medium">
                Pembayaran {normalizedStatus === 'paid' ? 'Lunas' : 'Menunggu Konfirmasi'}
              </span>
            </div>
          </div>
        </div>

        {/* Struk Contact */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 shadow-lg p-4 mb-3 border border-green-200">
          <div className="text-center">
            {/* Header dengan ikon */}
            <div className="flex items-center justify-center mb-3">
              <div className="bg-green-100 rounded-full p-2 mr-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-bold text-gray-800">KONFIRMASI PEMBAYARAN</div>
            </div>
            
            {/* QR Code dengan border yang lebih menarik */}
            <div className="bg-white rounded-xl p-3 shadow-inner border-2 border-green-200 mb-3">
              <QRCodeGenerator message={whatsappMessage} />
            </div>
            
            {/* Instruksi dengan ikon */}
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-semibold text-gray-700">Cara Konfirmasi:</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">1.</span>
                  <span>Scan QR Code di atas</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">2.</span>
                  <span>WhatsApp akan terbuka otomatis</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">3.</span>
                  <span>Kirim pesan konfirmasi</span>
                </div>
              </div>
            </div>
            
            {/* Info tambahan */}
            <div className="mt-3 bg-blue-50 rounded-lg p-2 border border-blue-200">
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-blue-700 font-medium">
                  Konfirmasi dalam 24 jam untuk memproses pesanan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Struk Footer */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 shadow-lg p-4 border border-green-200">
          <div className="text-center">
            {/* Thank you dengan ikon */}
            <div className="flex items-center justify-center mb-2">
              <div className="bg-green-100 rounded-full p-2 mr-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-800">TERIMA KASIH</p>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">
              Sampai jumpa di petualangan berikutnya! 🌟
            </p>
            
            {/* Contact info dengan ikon */}
            <div className="bg-white rounded-lg p-3 border border-green-200 mb-3">
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-xs text-gray-700 font-medium">Hubungi Kami:</span>
                </div>
                <div className="text-xs text-gray-600">
                  📞 +62 857-0183-4668
                </div>
                <div className="text-xs text-gray-600">
                  🌐 gemitra.com
                </div>
              </div>
            </div>
            
            {/* Powered by dengan ikon */}
            <div className="border-t border-gray-200 pt-2">
              <div className="flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-xs text-gray-400">
                  Powered by Gemitra Jogja
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}