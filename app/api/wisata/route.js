// app/api/wisata/route.js
import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient";

export async function GET() {
  try {
    // Test koneksi ke Supabase
    const { data, error } = await supabase.from("Wisata").select("*").limit(1);

    if (error) throw error;

    return NextResponse.json(
      {
        status: "success",
        message: "Connected to Supabase!",
        data: data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to Supabase",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
