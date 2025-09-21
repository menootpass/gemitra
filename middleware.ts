import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Performance headers for static assets
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/images/') || pathname.startsWith('/svg/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vary', 'Accept-Encoding');
  }
  
  // API routes caching
  if (pathname.startsWith('/api/')) {
    if (pathname.includes('/destinations') || pathname.includes('/events')) {
      response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    } else {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
  
  // HTML pages caching
  if (pathname === '/' || pathname.startsWith('/wisata') || pathname.startsWith('/event')) {
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  }
  
  // Compress response for better performance
  const acceptEncoding = request.headers.get('accept-encoding');
  if (acceptEncoding?.includes('gzip')) {
    response.headers.set('Content-Encoding', 'gzip');
  }
  
  // Add performance timing headers
  response.headers.set('X-Response-Time', Date.now().toString());
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};