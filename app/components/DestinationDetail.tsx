"use client";
import Image from "next/image";
import Link from "next/link";

type Destination = {
  id: number;
  nama: string;
  lokasi: string;
  rating: number;
  kategori: string;
  img: string;
  deskripsi: string;
  fasilitas: string[];
  komentar: any[];
};

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
        <Image src={destination.img} alt={destination.nama} fill className="object-cover w-full h-full" />
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
        <p className="text-black/80 text-sm line-clamp-3">{destination.deskripsi}</p>
        <div className="flex flex-wrap gap-1">
          {destination.fasilitas.slice(0, 3).map((f: string) => (
            <span key={f} className="px-2 py-1 rounded-full bg-[#213DFF11] text-[#213DFF] text-xs font-semibold">
              {f}
            </span>
          ))}
          {destination.fasilitas.length > 3 && (
            <span className="px-2 py-1 rounded-full bg-[#16A86E11] text-[#16A86E] text-xs font-semibold">
              +{destination.fasilitas.length - 3} lagi
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