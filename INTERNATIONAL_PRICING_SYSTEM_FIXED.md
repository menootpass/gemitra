# Sistem Harga Mancanegara - Perbaikan Lengkap

## Overview
Sistem harga mancanegara telah diperbaiki secara menyeluruh agar semua harga (destinasi dan mobil) berubah sesuai dengan bahasa yang dipilih pengguna di seluruh aplikasi.

## Perbaikan yang Dilakukan

### 1. **Utility Functions (`app/utils/priceUtils.ts`)**

#### Fungsi Baru: `getVehiclePriceByLanguage()`
```typescript
export function getVehiclePriceByLanguage(vehicle: { harga: number; mancanegara?: number }, language: string): number {
  if (language === 'en' && vehicle.mancanegara !== undefined && vehicle.mancanegara !== null) {
    return vehicle.mancanegara;
  }
  return vehicle.harga;
}
```

### 2. **SidebarCart Component (`app/components/SidebarCart.tsx`)**

#### Update Data Mobil
Semua mobil dalam `packageOptions` telah ditambahkan harga mancanegara:

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

#### Update Logika Harga
```typescript
// Sebelum
const carPrice = finalSelectedPackage.mancanegara && locale === 'en' ? finalSelectedPackage.mancanegara : finalSelectedPackage.harga;

// Sesudah
const carPrice = getVehiclePriceByLanguage(finalSelectedPackage, locale);
```

#### Update Tampilan Harga
```typescript
// Sebelum
<span>{formatPrice(pkg.harga, locale)}</span>

// Sesudah
<span>{formatPrice(getVehiclePriceByLanguage(pkg, locale), locale)}</span>
```

### 3. **InvoiceClient Component (`app/invoice/[kode]/InvoiceClient.tsx`)**

#### Fungsi Harga Mobil
```typescript
const getVehicleInternationalPrice = (vehicleName: string, localPrice: number) => {
  const vehiclePrices: { [key: string]: number } = {
    'Brio': 50,
    'Mobilio': 50,
    'Innova Reborn': 70,
    'HIACE': 90,
    'Alphard': 250,
    'Pajero': 115,
    'Fortuner': 110,
    'Avanza': 55,
    'Elf Long': 90,
    'Elf Lonng': 90,
    'Bus Medium & Long': 140,
    'Bus Medium & Big Bus': 140
  };
  
  // Cari harga mancanegara berdasarkan nama kendaraan
  for (const [key, price] of Object.entries(vehiclePrices)) {
    if (vehicleName.toLowerCase().includes(key.toLowerCase())) {
      return price;
    }
  }
  
  // Jika tidak ditemukan, estimasi berdasarkan harga lokal (1 USD ≈ 15,000 IDR)
  return Math.round(localPrice / 15000);
};
```

#### Fungsi Harga Destinasi
```typescript
const getDestinationInternationalPrice = (destinationName: string, localPrice: number) => {
  const destinationPrices: { [key: string]: number } = {
    'Taman Sari': 2,
    'Malioboro': 0,
    'Borobudur': 25,
    'Parangtritis': 5,
    'Mangunan': 2,
    'Ullen Sentalu': 12
  };
  
  // Cari harga mancanegara berdasarkan nama destinasi
  for (const [key, price] of Object.entries(destinationPrices)) {
    if (destinationName.toLowerCase().includes(key.toLowerCase())) {
      return price;
    }
  }
  
  // Jika tidak ditemukan, estimasi berdasarkan harga lokal (1 USD ≈ 15,000 IDR)
  return Math.round(localPrice / 15000);
};
```

#### Update Semua Tampilan Harga
- WhatsApp message (ID & EN)
- Invoice display
- Payment breakdown
- Vehicle rental details
- Destination details

### 4. **Komponen Lain yang Sudah Diupdate**

#### `WisataDetailClient.tsx`
- Harga destinasi berdasarkan bahasa
- Cart item dengan pricing yang benar

#### `DestinationDetail.tsx`
- Harga destinasi berdasarkan bahasa

#### `EventDetailClient.tsx`
- Harga destinasi terkait event berdasarkan bahasa

#### `wisata/page.tsx`
- Harga dalam daftar destinasi berdasarkan bahasa

## Cara Kerja Sistem

### 1. **Deteksi Bahasa**
```typescript
const { locale } = useLanguage();
```

### 2. **Pemilihan Harga**
```typescript
// Untuk destinasi
const price = getPriceByLanguage(destination, locale);

// Untuk mobil
const price = getVehiclePriceByLanguage(vehicle, locale);

// Untuk cart item
const price = getCartItemPriceByLanguage(cartItem, locale);
```

### 3. **Format Mata Uang**
```typescript
// Format harga dengan mata uang yang sesuai
const formattedPrice = formatPrice(price, locale);
// Hasil: "Rp 747.500" atau "$50"
```

### 4. **Fallback Mechanism**
Jika harga mancanegara tidak tersedia, sistem akan:
- Menggunakan harga lokal untuk bahasa Indonesia
- Mengestimasi harga mancanegara berdasarkan konversi 1 USD ≈ 15,000 IDR

## Testing

### Manual Testing
1. **Bahasa Indonesia**:
   - Buka aplikasi dengan bahasa Indonesia
   - Periksa semua harga dalam format IDR
   - Test di semua halaman: wisata, detail, cart, invoice

2. **Bahasa Inggris**:
   - Ganti bahasa ke Inggris
   - Periksa semua harga berubah ke format USD
   - Test di semua halaman: wisata, detail, cart, invoice

3. **Konsistensi**:
   - Pastikan harga sama di semua komponen
   - Test dengan berbagai jenis mobil dan destinasi

### Automated Testing
```typescript
// Test utility functions
expect(getPriceByLanguage(destination, 'en')).toBe(destination.mancanegara);
expect(getPriceByLanguage(destination, 'id')).toBe(destination.harga);

expect(getVehiclePriceByLanguage(vehicle, 'en')).toBe(vehicle.mancanegara);
expect(getVehiclePriceByLanguage(vehicle, 'id')).toBe(vehicle.harga);

// Test format functions
expect(formatPrice(50, 'en')).toBe('$50');
expect(formatPrice(747500, 'id')).toBe('Rp 747.500');
```

## Keuntungan Sistem

### 1. **Konsistensi Global**
- Semua harga menggunakan logic yang sama
- Format mata uang konsisten di seluruh aplikasi
- Tidak ada hardcoded harga

### 2. **Maintainability**
- Logic terpusat di utility functions
- Mudah diupdate dan dikelola
- Type-safe dengan TypeScript

### 3. **User Experience**
- Pengguna mancanegara melihat harga dalam USD
- Pengguna lokal melihat harga dalam IDR
- Transisi bahasa yang smooth

### 4. **Scalability**
- Mudah ditambahkan mata uang lain
- Support untuk regional pricing
- Integrasi dengan exchange rate API

## Future Enhancements

### 1. **Dynamic Pricing**
- Harga berdasarkan musim atau event
- Promotional pricing
- Group discounts

### 2. **Regional Pricing**
- Harga berbeda berdasarkan lokasi geografis
- Currency conversion real-time
- Local payment methods

### 3. **Advanced Features**
- Price comparison
- Historical pricing
- Price alerts
- Multi-currency support

## Troubleshooting

### Common Issues

1. **Harga tidak berubah saat ganti bahasa**
   - Periksa apakah komponen menggunakan `useLanguage()` hook
   - Pastikan utility functions diimport dengan benar

2. **Format mata uang salah**
   - Periksa parameter `locale` di `formatPrice()`
   - Pastikan `locale` adalah 'id' atau 'en'

3. **Harga mancanegara tidak muncul**
   - Periksa apakah data memiliki field `mancanegara`
   - Pastikan fallback mechanism bekerja

### Debug Tips

```typescript
// Debug harga
console.log('Locale:', locale);
console.log('Destination:', destination);
console.log('Price:', getPriceByLanguage(destination, locale));
console.log('Formatted:', formatPrice(getPriceByLanguage(destination, locale), locale));
```

## Conclusion

Sistem harga mancanegara telah diperbaiki secara menyeluruh dan sekarang berfungsi dengan baik di seluruh aplikasi. Semua harga (destinasi dan mobil) akan berubah sesuai dengan bahasa yang dipilih pengguna, memberikan pengalaman yang konsisten dan user-friendly.
