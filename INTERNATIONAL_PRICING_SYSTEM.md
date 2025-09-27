# Sistem Harga Mancanegara

## Overview
Sistem ini memungkinkan aplikasi untuk menampilkan harga yang berbeda berdasarkan bahasa yang dipilih pengguna. Ketika pengguna memilih bahasa Inggris, harga akan berubah menjadi harga mancanegara (dalam USD).

## Implementasi

### 1. Database Schema
- Kolom `harga`: Harga untuk pengguna lokal (IDR)
- Kolom `mancanegara`: Harga untuk pengguna mancanegara (USD)

### 2. Type Definitions
```typescript
export interface Destination {
  id: number;
  nama: string;
  harga?: number; // Harga lokal (IDR)
  mancanegara?: number; // Harga mancanegara (USD)
  // ... other fields
}

export interface CartItem {
  id: number;
  nama: string;
  harga?: number; // Harga lokal (IDR)
  mancanegara?: number; // Harga mancanegara (USD)
  // ... other fields
}
```

### 3. Utility Functions (`app/utils/priceUtils.ts`)

#### `getPriceByLanguage(destination, language)`
Mengembalikan harga yang sesuai berdasarkan bahasa:
- `language === 'en'`: Mengembalikan `mancanegara` jika tersedia
- `language === 'id'`: Mengembalikan `harga` lokal

#### `getCartItemPriceByLanguage(cartItem, language)`
Mengembalikan harga cart item berdasarkan bahasa.

#### `formatPrice(price, language)`
Memformat harga dengan mata uang yang sesuai:
- `language === 'en'`: Format USD (`$1,234`)
- `language === 'id'`: Format IDR (`Rp 1.234.567`)

#### `createCartItemWithPricing(destination, language)`
Membuat cart item dengan informasi harga yang lengkap.

### 4. Komponen yang Diupdate

#### `WisataDetailClient.tsx`
- Menampilkan harga berdasarkan bahasa yang dipilih
- Menggunakan `getPriceByLanguage()` dan `formatPrice()`

#### `SidebarCart.tsx`
- Menghitung total harga berdasarkan bahasa
- Menampilkan harga dalam format yang sesuai

#### `DestinationDetail.tsx`
- Menampilkan harga destinasi berdasarkan bahasa

#### `EventDetailClient.tsx`
- Menampilkan harga destinasi terkait event berdasarkan bahasa

#### `wisata/page.tsx`
- Menampilkan harga dalam daftar destinasi berdasarkan bahasa

### 5. Data Test
File `app/data/testDestinations.ts` telah diupdate dengan harga mancanegara:
- Taman Sari: IDR 15,000 / USD 2
- Candi Borobudur: IDR 50,000 / USD 25
- Pantai Parangtritis: IDR 10,000 / USD 5
- Hutan Pinus Mangunan: IDR 5,000 / USD 2
- Museum Ullen Sentalu: IDR 25,000 / USD 12

## Cara Kerja

1. **Deteksi Bahasa**: Sistem menggunakan `useLanguage()` hook untuk mendapatkan bahasa saat ini
2. **Pemilihan Harga**: Berdasarkan bahasa, sistem memilih antara `harga` (IDR) atau `mancanegara` (USD)
3. **Format Mata Uang**: Harga diformat sesuai dengan mata uang yang dipilih
4. **Konsistensi**: Semua komponen menggunakan utility functions yang sama untuk memastikan konsistensi

## Keuntungan

1. **Fleksibilitas**: Mendukung dua mata uang tanpa mengubah struktur database
2. **Konsistensi**: Semua komponen menggunakan logic yang sama
3. **Maintainability**: Logic harga terpusat di utility functions
4. **Scalability**: Mudah ditambahkan mata uang lain di masa depan

## Testing

Untuk menguji sistem:
1. Ganti bahasa ke Inggris
2. Periksa apakah harga berubah ke format USD
3. Ganti bahasa ke Indonesia
4. Periksa apakah harga kembali ke format IDR
5. Test di semua komponen yang menampilkan harga

## Future Enhancements

1. **Multiple Currencies**: Support untuk lebih banyak mata uang
2. **Exchange Rate**: Integrasi dengan API exchange rate real-time
3. **Regional Pricing**: Harga berdasarkan lokasi geografis
4. **Dynamic Pricing**: Harga berdasarkan waktu atau musim
