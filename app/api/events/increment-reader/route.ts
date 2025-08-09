import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing event id' }, { status: 400 });
    }

    const SCRIPT_URL = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec';

    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'incrementpembaca', id })
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ success: false, message: text || 'Failed to increment' }, { status: 500 });
    }

    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
