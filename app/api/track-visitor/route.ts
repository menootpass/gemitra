import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const MAIN_URL = process.env.GEMITRA_MAIN_APP_SCRIPT_URL || process.env.NEXT_PUBLIC_GEMITRA_MAIN_APP_SCRIPT_URL;
  if (!MAIN_URL) {
    return NextResponse.json({ success: false, error: "GEMITRA_MAIN_APP_SCRIPT_URL or NEXT_PUBLIC_GEMITRA_MAIN_APP_SCRIPT_URL not set" }, { status: 500 });
  }
  try {
    const res = await fetch(MAIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "trackVisitor" }),
    });
    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
