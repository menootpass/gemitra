"use client";
import { useState } from "react";
import { ChatCircle } from "phosphor-react";
import { apiService } from "../services/api";

interface CommentFormProps {
  destinationId: number;
  onCommentAdded: (newComment?: any) => void;
}

interface CommentFormData {
  invoiceCode: string;
  komentar: string;
}

export default function CommentForm({ destinationId, onCommentAdded }: CommentFormProps) {
  const [formData, setFormData] = useState<CommentFormData>({
    invoiceCode: "",
    komentar: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.invoiceCode.trim() || !formData.komentar.trim()) {
      setMessage({ type: "error", text: "Harap lengkapi kode invoice dan komentar." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await apiService.postComment({
        ...formData,
        destinationId,
      });

      setMessage({ type: "success", text: "Komentar berhasil ditambahkan!" });
      setFormData({ invoiceCode: "", komentar: "" });
      
      // Get the comment data from the response
      const commentData = result.comment || {
        nama: result.debug?.namaFromDatabase || "User",
        komentar: formData.komentar,
        tanggal: new Date().toISOString()
      };
      
      onCommentAdded(commentData); // Pass the new comment data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-[#213DFF11]">
      <div className="flex items-center gap-2 mb-4">
        <ChatCircle size={24} className="text-[#16A86E]" weight="bold" />
        <h3 className="text-lg font-bold text-[#213DFF]">Tambah Komentar</h3>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          message.type === "success" 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-red-100 text-red-800 border border-red-200"
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Info:</strong> Nama pengguna akan diambil otomatis dari database berdasarkan kode invoice yang Anda masukkan.
          </p>
        </div>

        <div>
          <label htmlFor="invoiceCode" className="block text-sm font-medium text-gray-700 mb-1">
            Kode Invoice *
          </label>
          <input
            type="text"
            id="invoiceCode"
            name="invoiceCode"
            value={formData.invoiceCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#213DFF] focus:border-transparent transition"
            placeholder="Contoh: GEM-ABC123XYZ"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Masukkan kode invoice yang Anda terima setelah melakukan booking
          </p>
        </div>

        <div>
          <label htmlFor="komentar" className="block text-sm font-medium text-gray-700 mb-1">
            Komentar *
          </label>
          <textarea
            id="komentar"
            name="komentar"
            value={formData.komentar}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#213DFF] focus:border-transparent transition resize-none"
            placeholder="Bagikan pengalaman Anda tentang destinasi ini..."
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#16A86E] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#213DFF] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Mengirim...
            </>
          ) : (
            <>
              <ChatCircle size={20} weight="bold" />
              Kirim Komentar
            </>
          )}
        </button>
      </form>
    </div>
  );
} 