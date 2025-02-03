"use client";

import { useRouter } from "next/navigation";

export default function PilihTujuanButton({ slug }) {
  const router = useRouter();

  const handleTujuan = () => {
    router.push(`/checkout/${slug}`);
  };

  return (
    <button
      onClick={handleTujuan}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Pilih Tujuan
    </button>
  );
}
