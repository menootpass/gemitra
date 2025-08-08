import { NextRequest, NextResponse } from "next/server";

const SCRIPT_URL = process.env.GEMITRA_MAIN_APP_SCRIPT_URL || process.env.NEXT_PUBLIC_GEMITRA_MAIN_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received transaction data:', body);
    
    const { 
      nama, 
      destinasi, 
      destinasi_harga, 
      penumpang, 
      tanggal_berangkat, 
      waktu_berangkat, 
      kendaraan, 
      kendaraan_harga, 
      total 
    } = body;

    // Validate required fields
    if (!nama || !destinasi || !kendaraan || !tanggal_berangkat || !waktu_berangkat) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const payload = {
      action: 'createTransaction',
      nama,
      destinasi,
      destinasi_harga: Array.isArray(destinasi_harga) ? destinasi_harga : [destinasi_harga],
      penumpang,
      tanggal_berangkat,
      waktu_berangkat,
      kendaraan,
      kendaraan_harga,
      total,
      timestamp: new Date().toISOString(),
    };

    console.log('Sending payload to Google Apps Script:', payload);

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log('Google Apps Script response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Apps Script error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Google Apps Script response data:', data);

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Transaksi berhasil dibuat",
        kode: data.kode || data.kodeInvoice || `TRX${Date.now()}`,
      });
    } else {
      return NextResponse.json(
        { success: false, message: data.message || "Gagal membuat transaksi" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in transaction API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Terjadi kesalahan pada server" 
      },
      { status: 500 }
    );
  }
} 