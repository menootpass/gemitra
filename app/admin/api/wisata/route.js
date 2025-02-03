// app/api/wisata/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Helper untuk handle error
const handleSupabaseError = (error) => {
  return NextResponse.json(
    {
      error: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    },
    { status: 500 }
  );
};

export async function POST(request) {
  try {
    const body = await request.json();

    // Validasi data
    if (!body.nama || !body.slug) {
      return NextResponse.json(
        { error: "Nama dan slug wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("Wisata") // Pastikan nama tabel sesuai
      .insert([body])
      .select(); // Untuk mendapatkan data yang baru dibuat

    if (error) throw error;

    return NextResponse.json({
      message: "Data berhasil ditambahkan",
      data: data[0],
    });
  } catch (error) {
    return handleSupabaseError(error);
  }
}

export async function PUT(request) {
  try {
    const { id, ...body } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("Wisata")
      .update(body)
      .eq("id", id)
      .select();

    if (error) throw error;

    return NextResponse.json({
      message: "Data berhasil diperbarui",
      data: data[0],
    });
  } catch (error) {
    return handleSupabaseError(error);
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    const { error } = await supabase.from("Wisata").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      message: "Data berhasil dihapus",
      deletedId: id,
    });
  } catch (error) {
    return handleSupabaseError(error);
  }
}
