"use client";
import Image from "next/image";
import Link from "next/link";
import { Destination } from "../types";

type DestinationDetailProps = {
  destination: Destination | null;
  onClose: () => void;
};

export default function DestinationDetail({ destination, onClose }: DestinationDetailProps) {
  if (!destination) {
    return (
      <div className="w-full h-96 bg-glass rounded-xl flex items-center justify-center">
        <div className="text-center text-black/60">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-bold text-[#213DFF] mb-2">Peta Destinasi Gemitra</h3>
          <p className="text-sm">Klik pin di peta untuk melihat detail destinasi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-glass rounded-xl overflow-hidden shadow-xl">
      <div className="relative w-full h-48">
        {destination.img ? (
          <Image src={destination.img} alt={destination.nama} fill className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="text-4xl mb-2">🏞️</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/90 text-[#213DFF] font-bold px-2 py-1 rounded-full text-xs hover:bg-white transition"
        >
          ✕
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#213DFF]">{destination.nama}</h3>
          <span className="text-[#16A86E] font-bold">{destination.rating}★</span>
        </div>
        <span className="text-black/60 text-sm">{destination.lokasi} &middot; {destination.kategori}</span>
        {destination.harga && (
          <div className="flex items-center gap-2">
            <span className="text-[#16A86E] font-bold text-base">
              Rp {destination.harga.toLocaleString("id-ID")}
            </span>
            <span className="text-gray-500 text-xs">per destinasi</span>
          </div>
        )}
        <p className="text-black/80 text-sm line-clamp-3">{destination.deskripsi}</p>
        
        {/* Informasi Pengunjung */}
        {destination.pengunjung !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#213DFF] font-semibold">👥</span>
            <span className="text-black/70">
              {destination.pengunjung.toLocaleString()} pengunjung
            </span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {(
            Array.isArray(destination.fasilitas)
              ? destination.fasilitas
              : String(destination.fasilitas || "").split(",")
          ).slice(0, 3).map((f: string, idx: number) => (
            <span key={f + idx} className="px-2 py-1 rounded-full bg-[#213DFF11] text-[#213DFF] text-xs font-semibold">
              {f}
            </span>
          ))}
          {((Array.isArray(destination.fasilitas)
              ? destination.fasilitas.length
              : String(destination.fasilitas || "").split(",").length) > 3) && (
            <span className="px-2 py-1 rounded-full bg-[#16A86E11] text-[#16A86E] text-xs font-semibold">
              +{(Array.isArray(destination.fasilitas)
                  ? destination.fasilitas.length
                  : String(destination.fasilitas || "").split(",").length) - 3} lagi
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <Link
            href={`/wisata/${destination.id}`}
            className="flex-1 bg-[#16A86E] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#213DFF] transition text-center text-sm"
          >
            Detail Lengkap
          </Link>
          <button className="bg-[#213DFF] text-white font-bold px-4 py-2 rounded-full shadow hover:bg-[#16A86E] transition text-sm">
            +
          </button>
        </div>
      </div>
    </div>
  );
} 