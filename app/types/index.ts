export interface Destination {
  id: number;
  nama: string;
  lokasi: string;
  rating: number;
  kategori: string;
  img: string;
  deskripsi: string;
  fasilitas: string[];
  komentar: Comment[];
  posisi?: [number, number];
  pengunjung?: number;
  harga?: number; // Added field for destination pricing
}

export interface Comment {
  nama: string;
  rating?: number;
  komentar?: string;
  isi?: string;
  tanggal?: string;
}

export interface CartItem {
  id: number;
  nama: string;
  harga?: number; // Added harga field for destination pricing
}

export interface LeafletInstance {
  Icon: {
    Default: {
      prototype: {
        _getIconUrl?: string;
      };
      mergeOptions: (options: Record<string, string>) => void;
    };
    divIcon: (options: Record<string, any>) => any;
  };
}

export interface LeafletIcon {
  className: string;
  html: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
} 