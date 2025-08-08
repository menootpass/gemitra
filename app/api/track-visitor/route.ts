import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const TRACTION_URL = process.env.GEMITRA_TRACTION_URL;
  if (!TRACTION_URL) {
    return NextResponse.json({ success: false, error: "GEMITRA_TRACTION_URL not set" }, { status: 500 });
  }
  try {
    // Kirim request ke Google Apps Script endpoint
    const res = await fetch(TRACTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "track_visitor" }),
    });
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
