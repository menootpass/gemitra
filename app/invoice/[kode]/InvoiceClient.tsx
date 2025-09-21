'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '../../contexts/LanguageContext';

// --- Tipe Data untuk Invoice ---
type InvoiceData = {
  nama: string;
  destinasi: string;
  penumpang: number;
  tanggal_berangkat: string;
  waktu_berangkat: string;
  kendaraan: string;
  total: number;
  status: 'Lunas' | 'Pending' | 'Batal' | 'pending' | 'lunas' | 'batal';
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
};

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
      console.log('✅ Parsed as JSON format:', destinationPricing);
    } catch (jsonError) {
      console.log('⚠️ Not JSON format, trying legacy format');
      
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
          nama
        });
        
        console.log(`✅ Parsed destinasi: ${nama} (${slug}) - Rp ${harga}`);
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
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodeURIComponent(whatsappUrl)}`;
  
  console.log('QR Code URL:', qrCodeUrl);
  // console.log('WhatsApp URL length:', whatsappUrl.length);
  // console.log('Message length:', message.length);
  
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
            className="mx-auto mb-4 rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-2 border-green-200" 
            width={200}
            height={200}
            onError={() => {
              console.error('QR Code failed to load');
              setQrCodeError(true);
            }}
            onLoad={() => {
              console.log('QR Code loaded successfully');
            }}
          />
        ) : (
          <div className="w-[200px] h-[200px] mx-auto mb-4 rounded-lg border-2 border-green-200 bg-green-50 flex flex-col items-center justify-center">
            <div className="text-green-600 text-4xl mb-2">📱</div>
            <div className="text-green-800 text-xs font-semibold text-center px-2">
              QR Code tidak bisa dimuat
            </div>
            <div className="text-green-600 text-xs mt-1">
              Klik untuk WhatsApp
            </div>
          </div>
        )}
      </a>
      
      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-2">
        {/* <p>URL Length: {whatsappUrl.length} chars</p>
        <p>Message Length: {message.length} chars</p> */}
        {qrCodeError && <p className="text-red-500">QR Code Error</p>}
      </div>
    </div>
  );
}

interface InvoiceClientProps {
  invoice: InvoiceData;
}

export default function InvoiceClient({ invoice }: InvoiceClientProps) {
  const { dictionary, locale } = useLanguage();

  // Fungsi untuk format angka ke Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  // Parse rincian destinasi dari database
  const destinasiItems = parseRincianDestinasi(invoice.rincian_destinasi || '');
  
  // Harga mobil dari database
  const hargaMobil = invoice.rincian_mobil || 0;
  
  // Hitung total harga destinasi
  const totalHargaDestinasi = destinasiItems.reduce((total, item) => total + item.harga, 0);
  
  // Diskon = 0 (tidak ada diskon)
  const diskon = 0;

  // Generate WhatsApp message (versi lebih pendek untuk QR code)
  const whatsappMessageShort = locale === 'id' 
    ? `Halo Gemitra! 🙏

Konfirmasi pembayaran invoice ${invoice.kode}:

👤 Nama: ${invoice.nama}
📅 Tanggal: ${invoice.tanggal_berangkat} ${invoice.waktu_berangkat}
👥 Penumpang: ${invoice.penumpang} pax

🗺️ Destinasi:
${destinasiItems.map((item, index) => `${index + 1}. ${item.nama}`).join('\n')}

🚗 Kendaraan: ${invoice.kendaraan}

💰 Total: Rp ${formatCurrency(invoice.total)}
✅ Status: ${invoice.status.toUpperCase()}

Mohon konfirmasi. Terima kasih! 🙏

Gemitra Tour & Travel
+62 857-0183-4668`
    : `Hello Gemitra! 🙏

Payment confirmation invoice ${invoice.kode}:

👤 Name: ${invoice.nama}
📅 Date: ${invoice.tanggal_berangkat} ${invoice.waktu_berangkat}
👥 Passengers: ${invoice.penumpang} pax

🗺️ Destinations:
${destinasiItems.map((item, index) => `${index + 1}. ${item.nama}`).join('\n')}

🚗 Vehicle: ${invoice.kendaraan}

💰 Total: Rp ${formatCurrency(invoice.total)}
✅ Status: ${invoice.status.toUpperCase()}

Please confirm. Thank you! 🙏

Gemitra Tour & Travel
+62 857-0183-4668`;

  // Generate WhatsApp message (versi lengkap untuk preview)
  const whatsappMessage = locale === 'id' 
    ? `Halo Gemitra! 🙏

Saya ingin konfirmasi pembayaran untuk pesanan wisata saya:

📋 DETAIL PEMESANAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Nama Lengkap: ${invoice.nama}
📧 Invoice Code: ${invoice.kode}
📅 Tanggal Berangkat: ${invoice.tanggal_berangkat}
⏰ Waktu Berangkat: ${invoice.waktu_berangkat}

🗺️ DESTINASI YANG DIKUNJUNGI:
━━━━━━━━━━━━━━━━━━━━━━━━━━
${destinasiItems.map((item, index) => `${index + 1}. ${item.nama}
   💰 Harga per pax: Rp ${formatCurrency(item.harga)}
   👥 Jumlah pax: ${invoice.penumpang} orang
   💵 Subtotal: Rp ${formatCurrency(item.harga * invoice.penumpang)}`).join('\n\n')}

🚗 KENDARAAN YANG DIPESAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ Tipe Kendaraan: ${invoice.kendaraan}
💰 Harga Sewa: Rp ${formatCurrency(hargaMobil)}
👥 Kapasitas: Sesuai kebutuhan (${invoice.penumpang} pax)

💰 RINCIAN PEMBAYARAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━
${destinasiItems.map(item => `• ${item.nama}: Rp ${formatCurrency(item.harga)} × ${invoice.penumpang} = Rp ${formatCurrency(item.harga * invoice.penumpang)}`).join('\n')}
• Sewa Kendaraan ${invoice.kendaraan}: Rp ${formatCurrency(hargaMobil)}
────────────────────────
💎 TOTAL PEMBAYARAN: Rp ${formatCurrency(invoice.total)}

✅ Status Pembayaran: ${invoice.status.toLowerCase() === 'lunas' ? 'LUNAS' : 'PENDING'}

Mohon konfirmasi untuk proses selanjutnya. Terima kasih! 🙏

---
📱 Gemitra Tour & Travel
🌐 gemitra.vercel.app
📞 +62 857-0183-4668`
    : `Hello Gemitra! 🙏

I would like to confirm payment for my tour order:

📋 ORDER DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Full Name: ${invoice.nama}
📧 Invoice Code: ${invoice.kode}
📅 Departure Date: ${invoice.tanggal_berangkat}
⏰ Departure Time: ${invoice.waktu_berangkat}

🗺️ DESTINATIONS TO VISIT:
━━━━━━━━━━━━━━━━━━━━━━━━━━
${destinasiItems.map((item, index) => `${index + 1}. ${item.nama}
   💰 Price per pax: Rp ${formatCurrency(item.harga)}
   👥 Number of pax: ${invoice.penumpang} people
   💵 Subtotal: Rp ${formatCurrency(item.harga * invoice.penumpang)}`).join('\n\n')}

🚗 VEHICLE BOOKED:
━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ Vehicle Type: ${invoice.kendaraan}
💰 Rental Price: Rp ${formatCurrency(hargaMobil)}
👥 Capacity: As needed (${invoice.penumpang} pax)

💰 PAYMENT BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━
${destinasiItems.map(item => `• ${item.nama}: Rp ${formatCurrency(item.harga)} × ${invoice.penumpang} = Rp ${formatCurrency(item.harga * invoice.penumpang)}`).join('\n')}
• ${invoice.kendaraan} Vehicle Rental: Rp ${formatCurrency(hargaMobil)}
────────────────────────
💎 TOTAL PAYMENT: Rp ${formatCurrency(invoice.total)}

✅ Payment Status: ${invoice.status.toLowerCase() === 'lunas' ? 'PAID' : 'PENDING'}

Please confirm for the next process. Thank you! 🙏

---
📱 Gemitra Tour & Travel
🌐 gemitra.vercel.app
📞 +62 857-0183-4668`;

  return (
    <div className="bg-gray-100 p-4 sm:p-8 font-sans min-h-screen">
      <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Header */}
        <header className="text-center mb-4">
          <Image 
            src="/svg/gemitra-logo.svg" 
            alt="Gemitra Logo" 
            width={60} 
            height={60} 
            className="mx-auto"
          />
          <h1 className="text-xl font-bold text-gray-800">{dictionary.invoice.title}</h1>
          <p className="text-sm text-gray-600 mt-1">{dictionary.invoice.companyName}</p>
          <p className="text-xs text-gray-500">{dictionary.invoice.website}</p>
          <p className="text-xs text-gray-500">{dictionary.invoice.phone}</p>
        </header>

        {/* Garis Pemisah */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Detail Transaksi */}
        <section className="text-xs text-gray-600 space-y-1 mb-4">
          <div className="flex justify-between">
            <span>{dictionary.invoice.orderNumber}</span>
            <span className="font-medium text-gray-800">{invoice.kode}</span>
          </div>
          <div className="flex justify-between">
            <span>{dictionary.invoice.date}</span>
            <span className="font-medium text-gray-800">{invoice.tanggal_berangkat} {invoice.waktu_berangkat}</span>
          </div>
          <div className="flex justify-between">
            <span>{dictionary.invoice.cashier}</span>
            <span className="font-medium text-gray-800">Online Booking</span>
          </div>
          <div className="flex justify-between">
            <span>{dictionary.invoice.customer}</span>
            <span className="font-medium text-gray-800">{invoice.nama}</span>
          </div>
        </section>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Daftar Item dengan Harga Transparan */}
        <main>
          <div className="space-y-4 text-sm">
            {/* Destinasi Items */}
            {destinasiItems.map((item, index) => (
              <div key={`dest-${index}`} className="border border-gray-200 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">{dictionary.invoice.tourPackage} {item.nama}</p>
                    <p className="text-xs text-gray-500">1 {dictionary.invoice.pax} × Rp {formatCurrency(item.harga)}</p>
                  </div>
                  <div className="text-right font-medium text-gray-800">
                    Rp {formatCurrency(item.harga)}
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>{dictionary.invoice.pricePerPax}</span>
                    <span>Rp {formatCurrency(item.harga)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{dictionary.invoice.quantity}</span>
                    <span>{invoice.penumpang}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>{dictionary.invoice.subtotal}</span>
                    <span>Rp {formatCurrency(item.harga * invoice.penumpang)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Kendaraan Item */}
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{dictionary.invoice.vehicleRental} {invoice.kendaraan}</p>
                  <p className="text-xs text-gray-500">1 {dictionary.invoice.unit} × Rp {formatCurrency(hargaMobil)}</p>
                </div>
                <div className="text-right font-medium text-gray-800">
                  Rp {formatCurrency(hargaMobil)}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Price per {dictionary.invoice.unit.toLowerCase()}:</span>
                  <span>Rp {formatCurrency(hargaMobil)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{dictionary.invoice.quantity}</span>
                  <span>1</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{dictionary.invoice.subtotal}</span>
                  <span>Rp {formatCurrency(hargaMobil)}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Rincian Pembayaran yang Transparan */}
        <section className="text-sm space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>{dictionary.invoice.subtotalDestinations} ({destinasiItems.length} item)</span>
            <span>Rp {formatCurrency(totalHargaDestinasi * invoice.penumpang)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{dictionary.invoice.subtotalVehicle}</span>
            <span>Rp {formatCurrency(hargaMobil)}</span>
          </div>
          <div className="flex justify-between text-gray-600 font-medium">
            <span>{dictionary.invoice.totalBeforeDiscount}</span>
            <span>Rp {formatCurrency((totalHargaDestinasi * invoice.penumpang) + hargaMobil)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{dictionary.invoice.discount}</span>
            <span>- Rp {formatCurrency(diskon)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
            <span>{dictionary.invoice.totalToPay}</span>
            <span>Rp {formatCurrency(invoice.total)}</span>
          </div>
        </section>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Detail Pembayaran */}
        <section className="text-sm space-y-2">
          <div className="flex justify-between font-semibold text-gray-800">
            <span>{dictionary.invoice.paymentMethod}</span>
            <span>Rp {formatCurrency(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{dictionary.invoice.change}</span>
            <span>Rp {formatCurrency(0)}</span>
          </div>
        </section>

        {/* Status Pembayaran */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
        <section className="text-center mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${
            invoice.status.toLowerCase() === 'lunas' || invoice.status.toLowerCase() === 'paid'
              ? 'text-green-600 bg-green-100'
              : invoice.status.toLowerCase() === 'batal' || invoice.status.toLowerCase() === 'cancelled'
              ? 'text-red-600 bg-red-100'
              : 'text-yellow-600 bg-yellow-100'
          }`}>
            {invoice.status.toLowerCase() === 'lunas' || invoice.status.toLowerCase() === 'paid' ? dictionary.invoice.status.paid :
             invoice.status.toLowerCase() === 'batal' || invoice.status.toLowerCase() === 'cancelled' ? dictionary.invoice.status.cancelled :
             dictionary.invoice.status.pending}
          </div>
        </section>

        {/* QR Code */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
        <section className="text-center mb-6">
          <div className="text-green-600 text-2xl mb-2">📱</div>
          <h3 className="text-sm font-bold text-green-800 mb-2">
            {locale === 'id' 
              ? 'Scan QR Code untuk WhatsApp'
              : 'Scan QR Code for WhatsApp'
            }
          </h3>
          <p className="text-xs text-green-700 leading-relaxed mb-4">
            {locale === 'id' 
              ? 'Scan QR Code di bawah ini untuk langsung mengirim pesan ke WhatsApp Gemitra dengan detail lengkap pesanan wisata Anda (nama, destinasi, kendaraan, total pembayaran). Atau klik QR Code untuk membuka WhatsApp di browser.'
              : 'Scan the QR Code below to directly send a message to Gemitra WhatsApp with complete tour order details (name, destinations, vehicle, total payment). Or click the QR Code to open WhatsApp in browser.'
            }
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <QRCodeGenerator message={whatsappMessageShort} />
            <p className="text-xs text-green-600 mt-2 font-medium">
              {locale === 'id' 
                ? 'Klik QR Code untuk langsung ke WhatsApp'
                : 'Click QR Code to go directly to WhatsApp'
              }
            </p>
          </div>
          
          {/* Preview Pesan */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="text-xs text-blue-800 font-semibold mb-2">
              {locale === 'id' 
                ? '📋 Preview Pesan yang Akan Dikirim:'
                : '📋 Message Preview to be Sent:'
              }
            </div>
            <div className="text-xs text-blue-700 bg-white rounded p-2 max-h-32 overflow-y-auto border">
              <div className="whitespace-pre-wrap font-mono text-xs">
                {whatsappMessage.length > 200 
                  ? whatsappMessage.substring(0, 200) + '...' 
                  : whatsappMessage
                }
              </div>
            </div>
            
          </div>
        </section>

        {/* Tombol WhatsApp */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
        <section className="text-center mb-6">
          <div className="mb-3">
            <p className="text-xs text-gray-600">
              {locale === 'id' 
                ? 'Atau gunakan tombol di bawah ini:'
                : 'Or use the button below:'
              }
            </p>
          </div>
          <a
            href={`https://wa.me/6285701834668?text=${encodeURIComponent(whatsappMessageShort)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-[#128C7E] transition-all transform hover:scale-105"
          >
            <span className="text-2xl">📱</span>
            <span>{dictionary.invoice.whatsappButton}</span>
          </a>
          <div className="mt-3 text-xs text-gray-500">
            <p>
              {locale === 'id' 
                ? '📱 Scan QR Code di atas atau klik tombol untuk langsung ke WhatsApp'
                : '📱 Scan QR Code above or click button to go directly to WhatsApp'
              }
            </p>
          </div>
        </section>

        {/* Instruksi Screenshot */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
        <section className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-blue-600 text-2xl mb-2">📸</div>
            <h3 className="text-sm font-bold text-blue-800 mb-2">{dictionary.invoice.screenshotTitle}</h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              {dictionary.invoice.screenshotDescription}
            </p>
            <div className="mt-3 text-xs text-blue-600">
              <p><strong>{dictionary.invoice.screenshotTips}</strong></p>
              <ul className="list-disc list-inside mt-1 text-left">
                <li>{locale === 'id' ? 'Gunakan tombol Print Screen (PrtScn)' : 'Use Print Screen button (PrtScn)'}</li>
                <li>{locale === 'id' ? 'Atau gunakan Snipping Tool' : 'Or use Snipping Tool'}</li>
                <li>{locale === 'id' ? 'Pastikan semua detail terlihat jelas' : 'Make sure all details are clearly visible'}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-sm font-semibold text-gray-800">{dictionary.invoice.thankYou}</p>
          <p className="text-xs text-gray-500 mt-1">
            {locale === 'id' 
              ? 'Sampai jumpa di petualangan berikutnya.'
              : 'See you on the next adventure.'
            }
          </p>
          <p className="text-xs text-gray-400 mt-6">{dictionary.invoice.poweredBy}</p>
        </footer>
      </div>
    </div>
  );
}
