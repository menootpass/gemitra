import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Handle redirect untuk /invoice?kode=... ke /api/invoice/[kode]
  if (pathname === '/invoice' && searchParams.has('kode')) {
    const kode = searchParams.get('kode');
    if (kode) {
      const newUrl = new URL(`/api/invoice/${kode}`, request.url);
      return NextResponse.redirect(newUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match /invoice path
    '/invoice',
    // Match /api/invoice/[kode] paths
    '/api/invoice/:path*'
  ],
};
