// app/invoice/[kode]/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';

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
};

// --- Fungsi untuk Fetch Data dari Google Apps Script ---
async function getInvoiceData(kode: string): Promise<InvoiceData | null> {
  if (!kode) {
    console.error('❌ Kode invoice kosong');
    return null;
  }

  const SCRIPT_URL = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL;
  if (!SCRIPT_URL) {
    console.error("❌ Google Apps Script URL is not defined in environment variables.");
    console.error("❌ NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL tidak ditemukan");
    return null;
  }
  
  const url = `${SCRIPT_URL}?action=get-transaction&kode=${kode}`;
  console.log(`🔍 Fetching data from: ${url}`);

  try {
    const response = await fetch(url, {
      method: 'GET',
      next: { revalidate: 10 } 
    });

    console.log(`📡 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error(`❌ Error details: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`📦 Response data:`, result);
    
    if (result.success && result.data) {
      console.log(`✅ Transaction found for kode: ${kode}`);
      return result.data as InvoiceData;
    } else {
      console.warn(`⚠️ Transaction not found: ${result.message}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to fetch invoice data:', error);
    return null;
  }
}

// --- Komponen Utama Halaman Invoice ---
export default async function InvoicePage({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  console.log(`🎯 Loading invoice for kode: ${kode}`);
  
  const invoice = await getInvoiceData(kode);

  // Fungsi untuk format angka ke Rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  // Jika invoice tidak ditemukan
  if (!invoice) {
    console.error(`❌ Invoice not found for kode: ${kode}`);
    return (
      <div className="bg-gray-100 p-4 sm:p-8 font-sans min-h-screen">
        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="text-center p-10">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600">Invoice Tidak Ditemukan</h2>
            <p className="text-gray-500 mt-2">Kode invoice &apos;{kode}&apos; tidak valid atau data tidak ada.</p>
            <div className="text-sm text-gray-400 mt-4">
              <p>Debug Info:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Kode: {kode}</li>
                <li>Environment Variable: {process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL ? '✅ Set' : '❌ Not Set'}</li>
                <li>Script URL: {process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || 'Not configured'}</li>
              </ul>
              <p className="mt-4">Pastikan:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Kode invoice sudah benar</li>
                <li>Data ada di database</li>
                <li>Google Apps Script sudah di-deploy</li>
                <li>Environment variable sudah dikonfigurasi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mapping data dari database ke format yang diinginkan
  const invoiceData = {
    orderNumber: invoice.kode,
    date: `${invoice.tanggal_berangkat} ${invoice.waktu_berangkat}`,
    cashier: "Online Booking",
    customerName: invoice.nama,
    items: [
      {
        name: `Paket Wisata ${invoice.destinasi}`,
        description: `${invoice.penumpang} Pax`,
        price: invoice.total
      },
      {
        name: `Sewa Kendaraan ${invoice.kendaraan}`,
        description: `1 Unit`,
        price: 0
      }
    ],
    subtotal: invoice.total,
    discount: 0,
    total: invoice.total,
    paymentMethod: "QRIS / Transfer",
    amountPaid: invoice.total,
    change: 0,
  } as const;

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
          <Image 
            src="/svg/gemitra-text.svg" 
            alt="Gemitra" 
            width={100} 
            height={100} 
          />
          <h1 className="text-xl font-bold text-gray-800">e-Receipt</h1>
          <p className="text-sm text-gray-600 mt-1">Gemitra Tour &amp; Travel</p>
          <p className="text-xs text-gray-500">gemitra.vercel.app</p>
          <p className="text-xs text-gray-500">+62 857-0183-4668</p>
        </header>

        {/* Garis Pemisah */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Detail Transaksi */}
        <section className="text-xs text-gray-600 space-y-1 mb-4">
          <div className="flex justify-between">
            <span>No. Pesanan:</span>
            <span className="font-medium text-gray-800">{invoiceData.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span className="font-medium text-gray-800">{invoiceData.date}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span className="font-medium text-gray-800">{invoiceData.cashier}</span>
          </div>
          <div className="flex justify-between">
            <span>Pelanggan:</span>
            <span className="font-medium text-gray-800">{invoiceData.customerName}</span>
          </div>
        </section>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Daftar Item */}
        <main>
          <div className="space-y-3 text-sm">
            {invoiceData.items.map((item, index) => (
              <div key={index} className="flex">
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
                <div className="text-right font-medium text-gray-800">
                  {item.price > 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(item.price)}` : 'Included'}
                </div>
              </div>
            ))}
          </div>
        </main>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Rincian Pembayaran */}
        <section className="text-sm space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(invoiceData.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Diskon Promo</span>
            <span>- {new Intl.NumberFormat('id-ID').format(invoiceData.discount)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200">
            <span>TOTAL</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(invoiceData.total)}</span>
          </div>
        </section>

        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

        {/* Detail Pembayaran */}
        <section className="text-sm space-y-2">
          <div className="flex justify-between font-semibold text-gray-800">
            <span>{invoiceData.paymentMethod}</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(invoiceData.amountPaid)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Kembalian</span>
            <span>Rp {new Intl.NumberFormat('id-ID').format(invoiceData.change)}</span>
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
            {invoice.status.toLowerCase() === 'lunas' || invoice.status.toLowerCase() === 'paid' ? '✅ LUNAS' :
             invoice.status.toLowerCase() === 'batal' || invoice.status.toLowerCase() === 'cancelled' ? '❌ DIBATALKAN' :
             '⏳ MENUNGGU PEMBAYARAN'}
          </div>
        </section>

        {/* Tombol WhatsApp */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
        <section className="text-center mb-6">
          <a
            href={`https://wa.me/6285701834668?text=${encodeURIComponent(`Halo! Saya ingin konfirmasi pembayaran untuk invoice ${invoiceData.orderNumber}.

Detail Pemesanan:
👤 Nama: ${invoiceData.customerName}
🗺️ Destinasi: ${invoiceData.items[0]?.name || 'Paket Wisata'}
👥 Jumlah Penumpang: ${invoiceData.items[0]?.description || 'Pax'}
🚗 Kendaraan: ${invoiceData.items[1]?.name || 'Sewa Kendaraan'}
📅 Tanggal: ${invoiceData.date}
💰 Total: Rp ${new Intl.NumberFormat('id-ID').format(invoiceData.total)}

Mohon informasi lebih lanjut untuk proses pembayaran. Terima kasih! 🙏`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:bg-[#128C7E] transition-all transform hover:scale-105"
          >
            <span className="text-2xl">📱</span>
            <span>Lanjutkan ke WhatsApp</span>
          </a>
        </section>

        {/* Instruksi Screenshot */}
        <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
        <section className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-blue-600 text-2xl mb-2">📸</div>
            <h3 className="text-sm font-bold text-blue-800 mb-2">Screenshot Invoice Ini</h3>
            <p className="text-xs text-blue-700 leading-relaxed">
              Simpan screenshot invoice ini sebagai bukti pembelian. 
              Kirimkan screenshot ke WhatsApp untuk konfirmasi pembayaran.
            </p>
            <div className="mt-3 text-xs text-blue-600">
              <p><strong>Tips Screenshot:</strong></p>
              <ul className="list-disc list-inside mt-1 text-left">
                <li>Gunakan tombol Print Screen (PrtScn)</li>
                <li>Atau gunakan Snipping Tool</li>
                <li>Pastikan semua detail terlihat jelas</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-8">
          <Image 
            src="https://placehold.co/150x150/png?text=QR+Code" 
            alt="QR Code" 
            className="mx-auto mb-4 rounded-lg" 
            width={200}
            height={200}
          />
          <p className="text-sm font-semibold text-gray-800">Terima Kasih!</p>
          <p className="text-xs text-gray-500 mt-1">Sampai jumpa di petualangan berikutnya.</p>
          <p className="text-xs text-gray-400 mt-6">Powered by Gemitra</p>
        </footer>
      </div>
    </div>
  );
}
