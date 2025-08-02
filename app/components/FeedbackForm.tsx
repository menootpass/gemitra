"use client";
import { useState } from "react";
import { ChatCircle, Star, User, Envelope, Phone, ChatText } from "phosphor-react";
import { apiService } from "../services/api";

interface FeedbackFormData {
  nama: string;
  email: string;
  telepon: string;
  kategori: string;
  rating: number;
  pesan: string;
}

export default function FeedbackForm() {
  const [formData, setFormData] = useState<FeedbackFormData>({
    nama: "",
    email: "",
    telepon: "",
    kategori: "umum",
    rating: 0,
    pesan: "",
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.nama.trim() || !formData.email.trim() || !formData.pesan.trim()) {
      setMessage({ type: "error", text: "Harap lengkapi nama, email, dan pesan." });
      return;
    }

    if (formData.rating === 0) {
      setMessage({ type: "error", text: "Harap berikan rating untuk layanan kami." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
        const result = await apiService.submitFeedback(formData);

        if (result.success) {
        setMessage({ type: "success", text: "Terima kasih! Feedback Anda berhasil dikirim." });
        setFormData({
          nama: "",
          email: "",
          telepon: "",
          kategori: "umum",
          rating: 0,
          pesan: "",
        });
      } else {
        setMessage({ type: "error", text: result.message || "Terjadi kesalahan saat mengirim feedback." });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-2xl border border-[#213DFF11] max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <ChatCircle size={32} className="text-[#16A86E]" weight="bold" />
          <h2 className="text-3xl font-extrabold text-[#213DFF]">Kirim Feedback</h2>
        </div>
        <p className="text-gray-600 text-lg">
          Kami sangat menghargai pendapat Anda untuk meningkatkan layanan Gemitra
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
          message.type === "success" 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama */}
        <div>
          <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <User size={16} className="text-[#16A86E]" />
            Nama Lengkap *
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#213DFF] focus:border-transparent transition text-lg"
            placeholder="Masukkan nama lengkap Anda"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Envelope size={16} className="text-[#16A86E]" />
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#213DFF] focus:border-transparent transition text-lg"
            placeholder="contoh@email.com"
            required
          />
        </div>

        {/* Telepon */}
        <div>
          <label htmlFor="telepon" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Phone size={16} className="text-[#16A86E]" />
            Nomor Telepon
          </label>
          <input
            type="tel"
            id="telepon"
            name="telepon"
            value={formData.telepon}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#213DFF] focus:border-transparent transition text-lg"
            placeholder="081234567890"
          />
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="kategori" className="block text-sm font-semibold text-gray-700 mb-2">
            Kategori Feedback
          </label>
          <select
            id="kategori"
            name="kategori"
            value={formData.kategori}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#213DFF] focus:border-transparent transition text-lg"
          >
            <option value="umum">Umum</option>
            <option value="layanan">Layanan</option>
            <option value="destinasi">Destinasi</option>
            <option value="website">Website</option>
            <option value="saran">Saran & Ide</option>
            <option value="keluhan">Keluhan</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Rating Layanan Kami *
          </label>
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all duration-200 hover:scale-110"
              >
                <Star
                  size={40}
                  weight={star <= (hoveredRating || formData.rating) ? "fill" : "regular"}
                  className={`${
                    star <= (hoveredRating || formData.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  } hover:text-yellow-400`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {formData.rating > 0
              ? `Rating: ${formData.rating} bintang${formData.rating > 1 ? 's' : ''}`
              : "Klik bintang untuk memberikan rating"
            }
          </p>
        </div>

        {/* Pesan */}
        <div>
          <label htmlFor="pesan" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <ChatText size={16} className="text-[#16A86E]" />
            Pesan Feedback *
          </label>
          <textarea
            id="pesan"
            name="pesan"
            value={formData.pesan}
            onChange={handleInputChange}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#213DFF] focus:border-transparent transition resize-none text-lg"
            placeholder="Bagikan pengalaman, saran, atau keluhan Anda tentang layanan Gemitra..."
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#16A86E] to-[#213DFF] text-white font-bold py-4 px-6 rounded-xl hover:from-[#213DFF] hover:to-[#16A86E] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Mengirim Feedback...
            </>
          ) : (
            <>
              <ChatCircle size={24} weight="bold" />
              Kirim Feedback
            </>
          )}
        </button>
      </form>

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Feedback Anda akan kami proses dalam 1-2 hari kerja
        </p>
      </div>
    </div>
  );
}