'use client';

import Image from 'next/image';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-8">
          <Image
            src="/svg/gemitra-logo.svg"
            alt="Gemitra Logo"
            width={120}
            height={120}
            className="mx-auto"
          />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Anda Sedang Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          Tidak ada koneksi internet. Beberapa fitur mungkin tidak tersedia.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#213DFF] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#16A86E] transition"
          >
            Coba Lagi
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition"
          >
            Kembali
          </button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Gemitra Jogja & Travel</p>
          <p>Hidden Gems Tourism</p>
        </div>
      </div>
    </div>
  );
}
