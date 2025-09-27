# Update Harga Mobil Mancanegara

## Overview
Telah ditambahkan harga mancanegara untuk semua jenis mobil di `SidebarCart.tsx` agar harga mobil dapat berubah sesuai dengan bahasa yang dipilih pengguna.

## Harga Mobil

### Harga Lokal (IDR) vs Harga Mancanegara (USD)

| Mobil | Harga Lokal (IDR) | Harga Mancanegara (USD) |
|-------|-------------------|-------------------------|
| Brio | 747,500 | 50 |
| Mobilio | 747,500 | 50 |
| Innova Reborn | 1,035,000 | 70 |
| HIACE | 1,380,000 | 90 |
| Alphard | 3,795,000 | 250 |
| Pajero | 1,725,000 | 115 |
| Fortuner | 1,610,000 | 110 |
| Avanza | 805,000 | 55 |
| Elf Long | 1,380,000 | 90 |
| Bus Medium & Big Bus | 2,070,000 | 140 |

## Implementasi

### 1. Update Data Mobil
Setiap item dalam `packageOptions` array telah ditambahkan field `mancanegara`:

```typescript
{
  key: "Brio",
  label: "Brio",
  harga: 747500,        // Harga lokal (IDR)
  mancanegara: 50,      // Harga mancanegara (USD)
  fasilitas: ["passengers4", "ac", "driver"],
  maxPassengers: 4,
  image: "/images/brio.jpg",
}
```

### 2. Update Logika Harga
Perhitungan harga mobil telah diupdate untuk menggunakan harga yang sesuai dengan bahasa:

```typescript
const carPrice = finalSelectedPackage.mancanegara && locale === 'en' 
  ? finalSelectedPackage.mancanegara 
  : finalSelectedPackage.harga;
```

### 3. Format Harga
Harga mobil akan diformat sesuai dengan bahasa:
- **Bahasa Indonesia**: `Rp 747.500`
- **Bahasa Inggris**: `$50`

## Cara Kerja

1. **Deteksi Bahasa**: Sistem menggunakan `locale` dari `useLanguage()` hook
2. **Pemilihan Harga**: 
   - Jika `locale === 'en'` dan `mancanegara` tersedia → gunakan harga USD
   - Jika tidak → gunakan harga lokal (IDR)
3. **Format Mata Uang**: Harga diformat menggunakan `formatPrice()` function
4. **Konsistensi**: Semua komponen menggunakan logic yang sama

## Testing

Untuk menguji sistem:
1. Buka aplikasi dan pilih bahasa Indonesia
2. Buka sidebar cart dan lihat harga mobil (harus dalam IDR)
3. Ganti bahasa ke Inggris
4. Lihat harga mobil (harus berubah ke USD)
5. Test dengan semua jenis mobil

## Keuntungan

1. **Fleksibilitas**: Mendukung dua mata uang untuk harga mobil
2. **Konsistensi**: Menggunakan sistem yang sama dengan harga destinasi
3. **User Experience**: Pengguna mancanegara melihat harga dalam USD
4. **Maintainability**: Mudah diupdate dan dikelola

## Future Enhancements

1. **Dynamic Pricing**: Harga berdasarkan musim atau event
2. **Regional Pricing**: Harga berbeda berdasarkan lokasi
3. **Promotional Pricing**: Diskon khusus untuk pengguna mancanegara
4. **Currency Conversion**: Integrasi dengan API exchange rate real-time
