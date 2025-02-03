"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Link,
  MapPin,
  Tag,
  TextAlignLeft,
  ListChecks,
  Image,
  MapPinLine,
} from "phosphor-react";

export default function CreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    slug: "",
    lokasi: "",
    harga: 0,
    deskripsi: "",
    fasilitas: "",
    foto: null,
  });

  const validateForm = () => {
    const requiredFields = ["nama", "slug", "lokasi", "deskripsi"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      alert(`Harap isi field yang wajib diisi: ${missingFields.join(", ")}`);
      return false;
    }

    if (formData.harga < 1000) {
      alert("Harga minimal 1000");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // 1. Upload gambar ke storage
      let fotoUrl = "";
      if (formData.foto) {
        const fileName = `${Date.now()}-${formData.foto.name}`;
        const { error: uploadError } = await supabase.storage
          .from("fotos")
          .upload(fileName, formData.foto);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("fotos")
          .getPublicUrl(fileName);

        fotoUrl = urlData.publicUrl;
      }

      // 2. Simpan data ke database
      const { error } = await supabase
        .from("Wisata") // Ganti dengan nama table Anda
        .insert([
          {
            ...formData,
            foto: fotoUrl,
            harga: Number(formData.harga),
            fasilitas: formData.fasilitas.split(",").map((f) => f.trim()),
          },
        ]);

      if (error) throw error;

      router.push("/admin"); // Redirect setelah sukses
    } catch (error) {
      alert(`Error : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      foto: e.target.files[0],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Buat Form Baru
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama
              </label>
              <div className="relative">
                <MapPinLine
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Masukkan nama wisata"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <div className="relative">
                <Link
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Masukkan slug"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Masukkan lokasi"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga
              </label>
              <div className="relative">
                <Tag
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="number"
                  name="harga"
                  value={formData.harga}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Masukkan harga"
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <div className="relative">
                <TextAlignLeft
                  className="absolute left-3 top-4 text-gray-400"
                  size={20}
                />
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
                  placeholder="Masukkan deskripsi"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fasilitas
              </label>
              <div className="relative">
                <ListChecks
                  className="absolute left-3 top-4 text-gray-400"
                  size={20}
                />
                <textarea
                  name="fasilitas"
                  value={formData.fasilitas}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32"
                  placeholder="Masukkan fasilitas (pisahkan dengan koma)"
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto
              </label>
              <div className="relative">
                <Image
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="file"
                  name="foto"
                  onChange={handleFileChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  accept="image/*"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-medium ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Menyimpan..." : "Simpan Data"}
        </button>
      </form>
    </div>
  );
}
