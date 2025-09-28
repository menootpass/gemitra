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
  total: number;
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

  // Hitung total berdasarkan bahasa
  const calculateTotalByLanguage = () => {
    let totalDestinations = 0;
    let totalVehicle = 0;
    
    // Hitung total destinasi
    destinasiItems.forEach(item => {
      if (locale === 'en') {
        totalDestinations += getDestinationInternationalPrice(item.slug);
      } else {
        totalDestinations += item.harga;
      }
    });
    
    // Hitung total kendaraan
    if (locale === 'en') {
      totalVehicle = getVehicleInternationalPrice(invoice.kendaraan, hargaMobil);
    } else {
      totalVehicle = hargaMobil;
    }
    
    return totalDestinations + totalVehicle;
  };

  const totalByLanguage = calculateTotalByLanguage();

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
        <div className="bg-white shadow-lg p-4 mb-3">
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              GEMITRA TOUR
            </h1>
            <p className="text-xs text-gray-600">
              Tour & Travel Service
            </p>
            <p className="text-xs text-gray-500 mt-1">
              gemitra.com
            </p>
            <p className="text-xs text-gray-500">
              Telp: +62 857-0183-4668
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-sm font-bold text-gray-800 mb-1">
              INVOICE
            </div>
            <div className="text-xs font-semibold text-[#16A86E] mb-2">
              #{invoice.kode}
            </div>
            <div className={`inline-block px-2 py-1 text-xs font-semibold border ${getStatusStyle(normalizedStatus)}`}>
              {getStatusText(normalizedStatus)}
            </div>
          </div>
        </div>

        {/* Struk Detail */}
        <div className="bg-white shadow-lg p-4 mb-3">
          <div className="border-b border-gray-200 pb-2 mb-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Tanggal:</span>
              <span className="font-semibold">{formatDate(invoice.tanggal_transaksi)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Waktu:</span>
              <span className="font-semibold">{invoice.waktu_transaksi}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Nama:</span>
              <span className="font-semibold text-right max-w-[60%] break-words">{invoice.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Penumpang:</span>
              <span className="font-semibold">{invoice.penumpang} org</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Destinasi:</span>
              <span className="font-semibold text-right max-w-[60%] break-words">{invoice.destinasi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tanggal Tour:</span>
              <span className="font-semibold">{formatDate(invoice.tanggal_berangkat)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Waktu Berangkat:</span>
              <span className="font-semibold">{formatTime(invoice.waktu_berangkat)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kendaraan:</span>
              <span className="font-semibold text-right max-w-[60%] break-words">{invoice.kendaraan}</span>
            </div>
          </div>
        </div>

        {/* Struk Item */}
        <div className="bg-white shadow-lg p-4 mb-3">
          <div className="border-b border-gray-200 pb-2 mb-2">
            <div className="text-xs font-semibold text-gray-800">RINCIAN PEMBAYARAN</div>
          </div>
          
          <div className="space-y-1 text-xs">
            {/* Destinations */}
            {destinasiItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600 break-words max-w-[60%]">{item.nama}</span>
                <span className="font-semibold">
                  {formatPrice(
                    locale === 'en' ? getDestinationInternationalPrice(item.slug) : item.harga,
                    locale
                  )}
                </span>
              </div>
            ))}
            
            {/* Vehicle */}
            <div className="flex justify-between">
              <span className="text-gray-600">Kendaraan</span>
              <span className="font-semibold">
                {formatPrice(
                  locale === 'en' ? getVehicleInternationalPrice(invoice.kendaraan, hargaMobil) : hargaMobil,
                  locale
                )}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between text-sm font-bold">
              <span>TOTAL:</span>
              <span className="text-[#16A86E]">
                {formatPrice(totalByLanguage, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Struk Payment */}
        <div className="bg-white shadow-lg p-4 mb-3">
          <div className="border-b border-gray-200 pb-2 mb-2">
            <div className="text-xs font-semibold text-gray-800">METODE PEMBAYARAN</div>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold">
                {formatPrice(totalByLanguage, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bayar:</span>
              <span className="font-semibold">
                {formatPrice(totalByLanguage, locale)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kembalian:</span>
              <span className="font-semibold">
                {formatPrice(0, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Struk Contact */}
        <div className="bg-white shadow-lg p-4 mb-3">
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-800 mb-2">KONFIRMASI PEMBAYARAN</div>
            <QRCodeGenerator message={whatsappMessage} />
            <p className="text-xs text-gray-600 mt-2">
              Scan QR Code untuk konfirmasi pembayaran
            </p>
          </div>
        </div>

        {/* Struk Footer */}
        <div className="bg-white shadow-lg p-4">
          <div className="text-center">
            <p className="text-xs font-semibold text-gray-800 mb-1">TERIMA KASIH</p>
            <p className="text-xs text-gray-500">
              Sampai jumpa di petualangan berikutnya
            </p>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <p className="text-xs text-gray-400">
                Powered by Gemitra Tour
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}