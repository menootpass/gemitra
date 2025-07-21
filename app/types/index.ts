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
}

export interface Comment {
  nama: string;
  rating: number;
  komentar?: string;
  isi?: string;
  tanggal?: string;
}

export interface CartItem {
  id: number;
  nama: string;
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