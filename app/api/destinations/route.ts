import { NextResponse } from 'next/server';

// Unified Google Apps Script URL
const SCRIPT_URL = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec';

// Cache configuration
const CACHE_TTL = 300; // 5 minutes for destinations
const REQUEST_TIMEOUT = 15000; // 15 seconds timeout (increased from 10s)

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Gemitra-App/1.0',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    let response;
    
    // Jika ada slug, fetch destinasi berdasarkan slug
    if (slug) {
      response = await fetchWithTimeout(`${SCRIPT_URL}?endpoint=destinations&slug=${encodeURIComponent(slug)}`, {
        next: { revalidate: CACHE_TTL },
      });
    } else {
      // Jika tidak ada slug, fetch semua destinasi
      response = await fetchWithTimeout(`${SCRIPT_URL}?endpoint=destinations`, {
        next: { revalidate: CACHE_TTL },
      });
    }

    if (!response.ok) {
      throw new Error(`Gagal mengambil data: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Add performance headers
    const responseTime = Date.now() - startTime;
    const nextResponse = NextResponse.json(data);
    
    // Add cache headers for better performance
    nextResponse.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`);
    nextResponse.headers.set('X-Response-Time', `${responseTime}ms`);
    nextResponse.headers.set('X-Cache', 'HIT');
    
    return nextResponse;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Error di API route:', error);
    
    // Handle different types of errors
    let errorMessage = 'Terjadi kesalahan server';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        errorMessage = 'Request timeout - server tidak merespons';
        statusCode = 408;
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error - tidak dapat terhubung ke server';
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }
    
    const errorResponse = NextResponse.json(
      { 
        message: 'Terjadi kesalahan pada server', 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        slug: searchParams.get('slug') || null
      },
      { status: statusCode }
    );
    
    errorResponse.headers.set('X-Response-Time', `${responseTime}ms`);
    errorResponse.headers.set('X-Cache', 'MISS');
    
    return errorResponse;
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