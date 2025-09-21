// app/invoice/[kode]/page.tsx

import React from 'react';
import type { Metadata } from 'next';
import InvoiceClient from './InvoiceClient';

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
  rincian_destinasi: string; // Format: "slug:harga, slug:harga, slug:harga"
  rincian_mobil: number; // Harga mobil saja
};

// --- Tipe Data untuk Item Destinasi ---
type DestinationItem = {
  slug: string;
  harga: number;
  nama: string;
};

// --- Fungsi untuk Fetch Data dari Google Apps Script ---
async function getInvoiceData(kode: string): Promise<InvoiceData | null> {
  if (!kode) {
    console.error('❌ Kode invoice kosong');
    return null;
  }

  const SCRIPT_URL = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec";
  console.log("Using SCRIPT_URL:", SCRIPT_URL);
  
  const url = `${SCRIPT_URL}?action=get-transaction&kode=${kode}`;
  console.log(`🔍 Fetching data from: ${url}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      method: 'GET',
      next: { revalidate: 10 },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

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
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Request timed out after 10 seconds');
    } else {
      console.error('❌ Failed to fetch invoice data:', error);
    }
    return null;
  }
}


// --- Komponen Utama Halaman Invoice ---
export default async function InvoicePage({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  console.log(`🎯 Loading invoice for kode: ${kode}`);
  
  const invoice = await getInvoiceData(kode);

  // Jika invoice tidak ditemukan
  if (!invoice) {
    console.error(`❌ Invoice not found for kode: ${kode}`);
    return (
      <div className="bg-gray-100 p-4 sm:p-8 font-sans min-h-screen">
        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="text-center p-10">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600">Invoice Not Found</h2>
            <p className="text-gray-500 mt-2">Invoice code &apos;{kode}&apos; is invalid or data not found.</p>
            <div className="text-sm text-gray-400 mt-4">
              <p>Debug Info:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Code: {kode}</li>
                <li>Environment Variable: {process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL ? '✅ Set' : '❌ Not Set'}</li>
                <li>Script URL: {process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || 'Not configured'}</li>
              </ul>
              <p className="mt-4">Please ensure:</p>
              <ul className="list-disc list-inside mt-2 text-left">
                <li>Invoice code is correct</li>
                <li>Data exists in database</li>
                <li>Google Apps Script is deployed</li>
                <li>Environment variable is configured</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <InvoiceClient invoice={invoice} />;
}
