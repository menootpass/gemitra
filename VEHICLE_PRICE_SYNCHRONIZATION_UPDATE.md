# Update Sinkronisasi Harga Kendaraan

## Perubahan yang Dilakukan

### 1. Update `app/components/SidebarCart.tsx`
Harga kendaraan disesuaikan dengan preferensi user:

```typescript
const packageOptions = [
  {
    key: "Brio",
    label: "Brio",
    harga: 747500,
    mancanegara: 50,        // ✅ Updated
    // ...
  },
  {
    key: "Mobilio",
    label: "Mobilio",
    harga: 747500,
    mancanegara: 50,        // ✅ Updated
    // ...
  },
  {
    key: "Innova Reborn",
    label: "Mobil Innova Reborn",
    harga: 1035000,
    mancanegara: 70,        // ✅ Updated
    // ...
  },
  {
    key: "HIACE",
    label: "HIACE",
    harga: 1380000,
    mancanegara: 90,        // ✅ Updated
    // ...
  },
  {
    key: "Alphard",
    label: "Alphard",
    harga: 3795000,
    mancanegara: 250,       // ✅ Updated
    // ...
  },
  {
    key: "Pajero",
    label: "Pajero",
    harga: 1725000,
    mancanegara: 115,       // ✅ Updated
    // ...
  },
  {
    key: "Fortuner",
    label: "Fortuner",
    harga: 1610000,
    mancanegara: 110,       // ✅ Updated
    // ...
  },
  {
    key: "Avanza",
    label: "Avanza",
    harga: 805000,
    mancanegara: 55,        // ✅ Updated
    // ...
  },
  {
    key: "Elf Lonng",       // ✅ Key name updated
    label: "Elf Long",
    harga: 1380000,
    mancanegara: 90,        // ✅ Updated
    // ...
  },
  {
    key: "Bus Medium & Long", // ✅ Key name updated
    label: "Bus Medium & Big Bus",
    harga: 2070000,
    mancanegara: 140,       // ✅ Updated
    // ...
  }
];
```

### 2. Update `app/invoice/[kode]/InvoiceClient.tsx`
Harga kendaraan di invoice disinkronkan dengan sidebar:

```typescript
const getVehicleInternationalPrice = (vehicleName: string, localPrice: number) => {
  const vehiclePrices: { [key: string]: number } = {
    'Brio': 50,             // ✅ Updated
    'Mobilio': 50,          // ✅ Updated
    'Innova Reborn': 70,    // ✅ Updated
    'HIACE': 90,            // ✅ Updated
    'Alphard': 250,         // ✅ Updated
    'Pajero': 115,          // ✅ Updated
    'Fortuner': 110,        // ✅ Updated
    'Avanza': 55,           // ✅ Updated
    'Elf Long': 90,         // ✅ Updated
    'Elf Lonng': 90,        // ✅ Updated
    'Bus Medium & Long': 140,     // ✅ Updated
    'Bus Medium & Big Bus': 140   // ✅ Updated
  };
  // ...
};
```

## Harga Kendaraan yang Disinkronkan

| Vehicle | Harga IDR | Harga USD (Sidebar) | Harga USD (Invoice) |
|---------|-----------|---------------------|---------------------|
| Brio | 747,500 | $50 | $50 ✅ |
| Mobilio | 747,500 | $50 | $50 ✅ |
| Innova Reborn | 1,035,000 | $70 | $70 ✅ |
| HIACE | 1,380,000 | $90 | $90 ✅ |
| Alphard | 3,795,000 | $250 | $250 ✅ |
| Pajero | 1,725,000 | $115 | $115 ✅ |
| Fortuner | 1,610,000 | $110 | $110 ✅ |
| Avanza | 805,000 | $55 | $55 ✅ |
| Elf Long | 1,380,000 | $90 | $90 ✅ |
| Bus Medium & Big Bus | 2,070,000 | $140 | $140 ✅ |

## Hasil

1. **Konsistensi Harga**: Semua harga kendaraan sekarang konsisten antara sidebar dan invoice
2. **Key Naming**: Key kendaraan diperbaiki ("Elf Lonng", "Bus Medium & Long")
3. **Sinkronisasi**: Harga USD di sidebar dan invoice menggunakan nilai yang sama
4. **User Experience**: User melihat harga yang konsisten di seluruh aplikasi

## Testing

Aplikasi sekarang menampilkan harga kendaraan yang konsisten:
- **Sidebar**: Menggunakan harga USD yang diperbarui
- **Invoice**: Menggunakan harga USD yang sama dengan sidebar
- **Bahasa Indonesia**: Menggunakan harga IDR
- **Bahasa Inggris**: Menggunakan harga USD yang konsisten
