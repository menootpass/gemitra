// app/admin/page.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function AdminPage() {
  const [wisata, setWisata] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWisata = async () => {
      try {
        const { data, error } = await supabase.from("Wisata").select("*");

        if (error) throw error;
        setWisata(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWisata();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        const { error } = await supabase.from("Wisata").delete().eq("id", id);

        if (error) throw error;
        setWisata(wisata.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }
  };

  if (loading) return <div>Memuat data...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin - Kelola Wisata</h1>
      <Link
        href="/admin/create"
        className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4 inline-block"
      >
        Tambah Wisata Baru
      </Link>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Nama</th>
              <th className="px-4 py-2 border">Lokasi</th>
              <th className="px-4 py-2 border">Harga</th>
              <th className="px-4 py-2 border">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {wisata.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 border">{item.nama}</td>
                <td className="px-4 py-2 border">{item.lokasi}</td>
                <td className="px-4 py-2 border">
                  Rp {item.harga.toLocaleString()}
                </td>
                <td className="px-4 py-2 border">
                  <Link
                    href={`/admin/edit/${item.id}`}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
