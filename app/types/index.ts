export interface Destination {
  id: number;
  nama: string;
  lokasi: string;
  rating: number;
  kategori: string;
  img: string | string[] | null;
  deskripsi: string;
  fasilitas: string | string[]; // Can be string or array to match Google Sheets
  komentar: Comment[];
  posisi?: [number, number];
  dikunjungi?: number; // Changed from pengunjung to match Google Sheets
  harga?: number; // Added field for destination pricing
  mancanegara?: number; // Added field for international pricing
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
  mancanegara?: number; // Added mancanegara field for international pricing
  slug?: string; // Added slug field for JSON pricing
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
  destinasi?: string[];
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