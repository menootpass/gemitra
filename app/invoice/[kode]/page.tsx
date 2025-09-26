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
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Request timeout - aborting after 15 seconds');
      controller.abort();
    }, 15000); // Increased to 15 seconds
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      next: { revalidate: 10 },
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.log(`📡 Response received in ${duration}ms - Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`);
      const errorText = await response.text();
      console.error(`❌ Error details: ${errorText}`);
      
      // Provide more specific error messages
      if (response.status === 404) {
        throw new Error(`Invoice not found: ${kode}`);
      } else if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const result = await response.json();
    console.log(`📦 Response data:`, result);
    
    if (result.success && result.data) {
      console.log(`✅ Transaction found for kode: ${kode}`);
      return result.data as InvoiceData;
    } else {
      console.warn(`⚠️ Transaction not found: ${result.message || 'No message provided'}`);
      return null;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('❌ Request timed out after 15 seconds - Google Apps Script may be slow or unresponsive');
      } else if (error.message.includes('fetch')) {
        console.error('❌ Network error - unable to reach Google Apps Script:', error.message);
      } else {
        console.error('❌ Failed to fetch invoice data:', error.message);
      }
    } else {
      console.error('❌ Unknown error occurred:', error);
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
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="text-center p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Invoice Not Found</h2>
            <p className="text-gray-500 mb-4">Invoice code &apos;{kode}&apos; is invalid or data not found.</p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-bold text-yellow-800 mb-2">🔧 Debug Information:</h3>
              <div className="text-xs text-yellow-700 text-left space-y-1">
                <div className="flex justify-between">
                  <span>Invoice Code:</span>
                  <span className="font-mono">{kode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment Variable:</span>
                  <span className={process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL ? 'text-green-600' : 'text-red-600'}>
                    {process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL ? '✅ Set' : '❌ Not Set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Script URL:</span>
                  <span className="font-mono text-xs break-all">
                    {process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL ? 
                      process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL.substring(0, 50) + '...' : 
                      'Not configured'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="font-mono">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-bold text-blue-800 mb-2">📋 Possible Solutions:</h3>
              <ul className="text-xs text-blue-700 text-left space-y-1">
                <li>• Verify the invoice code is correct</li>
                <li>• Check if the transaction exists in the database</li>
                <li>• Ensure Google Apps Script is deployed and accessible</li>
                <li>• Verify environment variable is configured correctly</li>
                <li>• Check Google Apps Script execution logs</li>
                <li>• Try refreshing the page after a few minutes</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-800 mb-2">🔄 Troubleshooting Steps:</h3>
              <div className="text-xs text-gray-600 text-left space-y-2">
                <div>
                  <strong>1. Check Console Logs:</strong>
                  <p className="mt-1">Open browser developer tools (F12) and check the Console tab for detailed error messages.</p>
                </div>
                <div>
                  <strong>2. Test API Directly:</strong>
                  <p className="mt-1">Try accessing the Google Apps Script URL directly in your browser to see if it responds.</p>
                </div>
                <div>
                  <strong>3. Contact Support:</strong>
                  <p className="mt-1">If the issue persists, contact the development team with the debug information above.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <InvoiceClient invoice={invoice} />;
}
