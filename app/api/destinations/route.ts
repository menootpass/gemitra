import { NextResponse } from 'next/server';

// URL Google Apps Script Anda
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3lxP14J__OOKLIiTQL1PLh0e2CMPAFzGbvKP8BiNT6LdfZ7EWmCIQSPx-JC9Ajl7ThQ/exec';

export async function GET() {
  try {
    const response = await fetch(SCRIPT_URL, {
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