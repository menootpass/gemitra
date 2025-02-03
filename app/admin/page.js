// app/admin/page.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Images from "next/image";
import Link from "next/link";
import {
  Pencil,
  Trash,
  MapPin,
  CurrencyDollar,
  Image,
  Table,
  Cards,
} from "phosphor-react";

export default function AdminPage() {
  const [displayMode, setDisplayMode] = useState("card"); // 'card' atau 'table'
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

  const handleAddData = () => {
    // Logika tambah data
    alert("Tambah data baru");
  };

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

  const truncateDescription = (text, maxWords) => {
    const words = text.split(" ");
    if (words.length > maxWords) {
      return words.slice(0, maxWords).join(" ") + "...";
    }
    return text;
  };

  const handleEdit = (id) => {
    // Logika edit
    alert(`Edit item dengan ID: ${id}`);
  };

  if (loading) return <div>Memuat data...</div>;

  console.log(wisata);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard Wisata
            </h1>
            <button
              onClick={handleAddData}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span> Tambah Data
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setDisplayMode("card")}
              className={`p-2 rounded-md flex items-center ${
                displayMode === "card"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Cards size={20} className="mr-2" /> Card View
            </button>
            <button
              onClick={() => setDisplayMode("table")}
              className={`p-2 rounded-md flex items-center ${
                displayMode === "table"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600"
              }`}
            >
              <Table size={20} className="mr-2" /> Table View
            </button>
          </div>
        </div>

        {/* Card Mode */}
        {displayMode === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wisata.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 relative">
                  {item.foto ? (
                    <Images
                      src={`/images/${item.foto}`}
                      width={200}
                      height={200}
                      alt={item.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Image size={48} />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.nama}
                  </h2>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="mr-2" size={20} />
                    <span>{item.lokasi}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <CurrencyDollar className="mr-2" size={20} />
                    <span>Rp {item.harga.toLocaleString()}</span>
                  </div>

                  <div className="border-t pt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(item.id)}
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                    >
                      <Pencil className="mr-1" size={18} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800 transition-colors flex items-center"
                    >
                      <Trash className="mr-1" size={18} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table Mode */}
        {displayMode === "table" && (
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Foto
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Nama Tempat
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {wisata.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg overflow-hidden">
                        {item.foto ? (
                          <Images
                            src={`/images/${item.foto}`}
                            width={200}
                            height={200}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Image size={20} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.nama}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="mr-2" size={16} />
                        {item.lokasi}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center">
                        <CurrencyDollar className="mr-2" size={16} />
                        Rp {item.harga.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
