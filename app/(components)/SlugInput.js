// File: components/SlugInput.js
"use client";
import { useEffect } from "react";

const SlugInput = ({ value, onChange }) => {
  const handleSlugChange = (e) => {
    const newValue = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "") // Hanya izinkan huruf kecil, angka, dan hyphen
      .replace(/-+/g, "-") // Hindari hyphen berurutan
      .replace(/^-|-$/g, ""); // Hapus hyphen di awal/akhir

    onChange(newValue);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleSlugChange}
      pattern="^[a-z0-9-]+$"
      title="Hanya boleh mengandung huruf kecil, angka, dan hyphen"
      className="w-full p-2 border rounded-md"
      required
    />
  );
};

export default SlugInput;
