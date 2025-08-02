import { NextResponse } from 'next/server';

const SCRIPT_URL = process.env.GEMITRA_TRANSACTIONS_URL!;
const DESTINATIONS_URL = process.env.GEMITRA_DESTINATIONS_URL!;

// Fungsi untuk generate kode unik
function generateUniqueCode(): string {
  return `GEM-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}



export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validasi data dasar
    if (!body.nama || !body.destinasi || !body.penumpang || !body.tanggal_berangkat || !body.kendaraan) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Siapkan payload untuk dikirim ke Google Apps Script
    const payload = {
      ...body,
      status: 'success',
      kode: generateUniqueCode(),
      tanggal_transaksi: new Date().toISOString(),
      waktu_transaksi: new Date().toISOString(),
    };

    // Kirim data ke Google Apps Script (includes visitor increment)
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status dari Google Apps Script:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Apps Script Error:', errorText);
        throw new Error(`Gagal mengirim data ke Google Apps Script: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Transaksi berhasil:', data);

    // Visitor increment sudah ditangani di Google Apps Script
    // Tidak perlu API call tambahan

    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 Error di API route (transactions):', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: errorMessage },
      { status: 500 }
    );
  }
} 