import { NextRequest, NextResponse } from "next/server";

const SCRIPT_URL = process.env.GEMITRA_TRANSACTION_URL!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, telepon, email, destinasi, kendaraan, tanggal, waktu, penumpang, totalHarga } = body;

    const payload = {
      nama,
      telepon,
      email,
      destinasi,
      kendaraan,
      tanggal,
      waktu,
      penumpang,
      totalHarga,
    };

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: "Transaksi berhasil dibuat",
        kodeInvoice: data.kodeInvoice,
      });
    } else {
      return NextResponse.json(
        { success: false, message: data.message || "Gagal membuat transaksi" },
        { status: 400 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error('Error in transaction API:', error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
} 