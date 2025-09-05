import { NextRequest, NextResponse } from "next/server";

const SCRIPT_URL = process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec";

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
      total,
      cart // New: cart data for detailed pricing
    } = body;

    // Validate required fields
    if (!nama || !destinasi || !kendaraan || !tanggal_berangkat || !waktu_berangkat) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Create detailed pricing JSON for destinations
    let rincianDestinasi = "{}";
    console.log('Cart data received:', cart);
    if (cart && Array.isArray(cart) && cart.length > 0) {
      const destinationPricing: Record<string, string> = {};
      cart.forEach((item: any) => {
        console.log('Processing cart item:', item);
        if (item.slug && item.harga) {
          destinationPricing[item.slug] = item.harga.toString();
        }
      });
      rincianDestinasi = JSON.stringify(destinationPricing);
      console.log('Generated rincianDestinasi:', rincianDestinasi);
    } else {
      console.log('No cart data or empty cart');
    }

    // Generate unique transaction code
    const timestamp = new Date();
    const kode = `TRX${timestamp.getFullYear()}${String(timestamp.getMonth() + 1).padStart(2, '0')}${String(timestamp.getDate()).padStart(2, '0')}${String(timestamp.getHours()).padStart(2, '0')}${String(timestamp.getMinutes()).padStart(2, '0')}${String(timestamp.getSeconds()).padStart(2, '0')}`;

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
      rincian_destinasi: rincianDestinasi,
      rincian_mobil: kendaraan_harga,
      status: 'pending',
      kode,
      waktu_transaksi: timestamp.toISOString(),
      tanggal_transaksi: timestamp.toISOString().split('T')[0],
      timestamp: timestamp.toISOString(),
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
        kode: data.kode || kode,
        data: {
          nama,
          destinasi,
          penumpang,
          tanggal_berangkat,
          waktu_berangkat,
          kendaraan,
          total,
          rincian_destinasi: rincianDestinasi,
          rincian_mobil: kendaraan_harga,
          status: 'pending',
          kode: data.kode || kode,
          waktu_transaksi: timestamp.toISOString(),
          tanggal_transaksi: timestamp.toISOString().split('T')[0],
        }
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