export interface Destination {
  id: number;
  nama: string;
  lokasi: string;
  rating: number;
  kategori: string;
  img: string | string[] | null;
  deskripsi: string;
  fasilitas: string[];
  komentar: Comment[];
  posisi?: [number, number];
  pengunjung?: number;
  harga?: number; // Added field for destination pricing
  slug: string; // Added slug field for URL routing
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

export interface Event {
  id: string;
  title: string;
  description: string | string[];
  image: string[] | null;
  date: string;
  location: string;
  category: string;
  totalPembaca: number;
  content: string | string[];
  author: string;
  slug: string;
} 

export interface Feedback {
  id: number;
  nama: string;
  email: string;
  telepon: string;
  kategori: string;
  rating: number;
  pesan: string;
  status: 'pending' | 'processed' | 'completed';
  timestamp: string;
} 