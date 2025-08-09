import { NextResponse } from 'next/server';

// Unified Google Apps Script URL
const SCRIPT_URL = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    // Jika ada slug, fetch destinasi berdasarkan slug
    if (slug) {
      const response = await fetch(`${SCRIPT_URL}?endpoint=destinations&slug=${encodeURIComponent(slug)}`, {
        next: { revalidate: 600 },
      });

      if (!response.ok) {
        throw new Error(`Gagal mengambil data: ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // Jika tidak ada slug, fetch semua destinasi
    const response = await fetch(`${SCRIPT_URL}?endpoint=destinations`, {
      // Opsi untuk revalidasi cache, misalnya setiap 10 menit
      next: { revalidate: 600 }, 
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error di API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    // Validasi data yang diperlukan
    if (!body.destinasi_id || !body.action) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Siapkan payload untuk update pengunjung
    const payload = {
      destinasi_id: body.destinasi_id,
      action: body.action, // 'increment' atau 'decrement'
      timestamp: new Date().toISOString(),
    };

    // Kirim data ke Google Apps Script untuk update pengunjung
    const response = await fetch(SCRIPT_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Apps Script Error:', errorText);
      throw new Error(`Gagal mengupdate data destinasi: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error di API route (destinations PATCH):', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: errorMessage },
      { status: 500 }
    );
  }
} 