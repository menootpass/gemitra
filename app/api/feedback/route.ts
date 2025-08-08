import { NextResponse } from 'next/server';

// Unified Google Apps Script URL
const SCRIPT_URL = process.env.GEMITRA_MAIN_APP_SCRIPT_URL || process.env.NEXT_PUBLIC_GEMITRA_MAIN_APP_SCRIPT_URL;

export async function POST(request: Request) {
  try {
    // Validasi environment variable
    if (!SCRIPT_URL) {
      console.error('GEMITRA_MAIN_APP_SCRIPT_URL tidak ditemukan di environment variables');
      return NextResponse.json({ 
        message: 'Konfigurasi server tidak lengkap. Silakan hubungi administrator.' 
      }, { status: 500 });
    }

    const body = await request.json();
    
    // Validasi data yang diperlukan
    if (!body.nama || !body.email || !body.pesan) {
      return NextResponse.json({ 
        message: 'Data tidak lengkap. Nama, email, dan pesan wajib diisi.' 
      }, { status: 400 });
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ 
        message: 'Format email tidak valid' 
      }, { status: 400 });
    }

    // Siapkan payload untuk feedback
    const payload = {
      action: 'createFeedback',
      nama: body.nama,
      email: body.email,
      telepon: body.telepon || '',
      kategori: body.kategori || 'umum',
      rating: body.rating || 0,
      pesan: body.pesan,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    console.log('Sending feedback to:', SCRIPT_URL);
    console.log('Payload:', payload);

    // Kirim data ke Google Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Apps Script Error Response:', errorText);
      throw new Error(`Gagal mengirim feedback: ${response.status} ${response.statusText}`);
    }

    // Cek content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Unexpected response type:', contentType);
      console.error('Response body:', responseText);
      throw new Error('Server mengembalikan response yang tidak valid');
    }

    try {
      const data = await response.json();
      console.log('Success response:', data);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      const responseText = await response.text();
      console.error('Raw response:', responseText);
      throw new Error('Gagal memparse response dari server');
    }

  } catch (error) {
    console.error('Error di API route (feedback):', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!SCRIPT_URL) {
      console.error('GEMITRA_MAIN_APP_SCRIPT_URL tidak ditemukan di environment variables');
      return NextResponse.json({ 
        message: 'Konfigurasi server tidak lengkap' 
      }, { status: 500 });
    }

    const response = await fetch(SCRIPT_URL, {
      next: { revalidate: 600 }, // Cache 10 menit
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error di API route (feedback GET):', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: errorMessage },
      { status: 500 }
    );
  }
}