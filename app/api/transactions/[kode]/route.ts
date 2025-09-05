import { NextRequest, NextResponse } from "next/server";

const SCRIPT_URL = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kode: string }> }
) {
  try {
    const { kode } = await params;
    
    if (!kode) {
      return NextResponse.json(
        { success: false, message: "Kode transaksi tidak ditemukan" },
        { status: 400 }
      );
    }

    console.log(`Fetching transaction data for kode: ${kode}`);

    const response = await fetch(`${SCRIPT_URL}?action=get-transaction&kode=${kode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Google Apps Script response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Apps Script error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Google Apps Script response data:', data);

    if (data.success && data.data) {
      return NextResponse.json({
        success: true,
        data: data.data
      });
    } else {
      return NextResponse.json(
        { success: false, message: data.message || "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Terjadi kesalahan pada server" 
      },
      { status: 500 }
    );
  }
}
