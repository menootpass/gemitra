import { NextResponse } from 'next/server';

// Unified Google Apps Script URL
const SCRIPT_URL = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec';

// Cache configuration - optimized for performance
const CACHE_TTL = 600; // 10 minutes for destinations (increased for better caching)
const REQUEST_TIMEOUT = 8000; // 8 seconds timeout (reduced from 15s for faster failure)

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
    
    let url = `${SCRIPT_URL}?endpoint=destinations`;
    if (slug) {
      url += `&slug=${encodeURIComponent(slug)}`;
    } else {
      // Use cache-friendly timestamp (round to nearest minute for better cache hits)
      const cacheKey = Math.floor(Date.now() / 60000);
      url += `&_t=${cacheKey}`;
    }

    const response = await fetchWithTimeout(url, {
      next: { 
        revalidate: slug ? CACHE_TTL : CACHE_TTL, // Enable caching for list too
        tags: ['destinations'] 
      },
    });

    if (!response.ok) {
      console.error(`Google Apps Script error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { 
          message: 'Gagal mengambil data', 
          error: `${response.status} ${response.statusText}`,
          timestamp: new Date().toISOString()
        },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;
    
    const nextResponse = NextResponse.json(data);
    // Optimized cache headers for better performance
    nextResponse.headers.set('Cache-Control', `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`);
    nextResponse.headers.set('X-Response-Time', `${responseTime}ms`);
    nextResponse.headers.set('X-Cache-Status', 'MISS'); // Will be HIT if served from cache
    
    return nextResponse;

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('API route error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Terjadi kesalahan server';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        statusCode = 408;
        errorMessage = 'Request timeout';
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        statusCode = 503;
        errorMessage = 'Network error';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        message: 'Terjadi kesalahan pada server', 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`
      },
      { status: statusCode }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.destinasi_id || !body.action) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const payload = {
      destinasi_id: body.destinasi_id,
      action: body.action,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(SCRIPT_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('Google Apps Script Error:', errorText);
      return NextResponse.json(
        { message: 'Gagal mengupdate data destinasi', error: response.statusText },
        { status: response.status >= 500 ? 502 : response.status }
      );
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
