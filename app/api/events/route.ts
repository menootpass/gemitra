import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');
    
    // Get the Google Apps Script URL from environment
    const scriptUrl = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || 
      'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec';
    
    // Build URL with parameters
    let url = `${scriptUrl}?endpoint=events`;
    if (slug) {
      url += `&slug=${encodeURIComponent(slug)}`;
    }
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    
    console.log('🔗 [API Route] Fetching events from:', url);
    console.log('📋 [API Route] Parameters:', { slug, category });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NextJS-Server'
      },
    });

    if (!response.ok) {
      console.error('❌ [API Route] Google Apps Script response not ok:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    let eventsData = data;
    if (data.data && Array.isArray(data.data)) {
      eventsData = data.data;
    } else if (Array.isArray(data)) {
      eventsData = data;
    }
    
    console.log('✅ [API Route] Events fetched successfully:', {
      slug,
      category,
      totalEvents: Array.isArray(eventsData) ? eventsData.length : 0,
      responseStructure: typeof data,
      hasDataKey: 'data' in data
    });
    
    // If requesting by slug and no events found, return 404
    if (slug && (!eventsData || (Array.isArray(eventsData) && eventsData.length === 0))) {
      console.log('❌ [API Route] Event not found for slug:', slug);
      return NextResponse.json(
        { error: 'Event tidak ditemukan', slug },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        }
      );
    }

    // Return the data with CORS headers
    return NextResponse.json(eventsData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ [API Route] Error fetching events:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch events', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
