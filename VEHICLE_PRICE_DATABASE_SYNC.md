# Vehicle Price Database Sync

## Masalah yang Diperbaiki

### **Harga Kendaraan Tidak Sesuai Database**
- **Masalah**: Harga kendaraan di SidebarCart tidak sesuai dengan kolom "mancanegara" dari database
- **Lokasi**: `app/components/SidebarCart.tsx` - `packageOptions` array
- **Penyebab**: Nilai `mancanegara` hardcoded tidak sesuai dengan database

## Perbaikan yang Dilakukan

### **Update Harga Kendaraan Sesuai Database**

#### **Sebelum (Hardcoded Values)**
```typescript
const packageOptions = [
  {
    key: "Brio",
    label: "Brio",
    harga: 747500,
    mancanegara: 50, // ❌ Tidak sesuai database
    // ...
  },
  {
    key: "Mobilio", 
    label: "Mobilio",
    harga: 747500,
    mancanegara: 50, // ❌ Tidak sesuai database
    // ...
  },
  // ... dst
];
```

#### **Sesudah (Sesuai Database)**
```typescript
const packageOptions = [
  {
    key: "Brio",
    label: "Brio", 
    harga: 747500,
    mancanegara: 44.69, // ✅ Sesuai database
    // ...
  },
  {
    key: "Mobilio",
    label: "Mobilio",
    harga: 747500, 
    mancanegara: 44.69, // ✅ Sesuai database
    // ...
  },
  // ... dst
];
```

## Data Harga yang Diperbarui

### **Berdasarkan Database Spreadsheet**

| Kendaraan | Harga IDR (markup) | Harga USD (mancanegara) | Status |
|-----------|-------------------|------------------------|--------|
| **Brio** | Rp 747,500 | $44.69 | ✅ Updated |
| **Mobilio** | Rp 747,500 | $44.69 | ✅ Updated |
| **Innova Reborn** | Rp 1,035,000 | $61.88 | ✅ Updated |
| **HIACE** | Rp 1,380,000 | $82.51 | ✅ Updated |
| **Alphard** | Rp 3,795,000 | $226.91 | ✅ Updated |
| **Pajero** | Rp 1,725,000 | $103.14 | ✅ Updated |
| **Fortuner** | Rp 1,610,000 | $96.26 | ✅ Updated |
| **Avanza** | Rp 805,000 | $48.13 | ✅ Updated |
| **Elf Long** | Rp 1,380,000 | $82.51 | ✅ Updated |
| **Bus Medium & Big Bus** | Rp 2,070,000 | $123.77 | ✅ Updated |

## Hasil

### **Bahasa Indonesia**
- Menampilkan harga dalam Rupiah (Rp) dari kolom `harga` (markup)
- Contoh: "Rp 747,500" untuk Brio

### **Bahasa Inggris** 
- Menampilkan harga dalam Dollar ($) dari kolom `mancanegara`
- Contoh: "$44.69" untuk Brio

### **Perhitungan Total**
- **Destinasi**: Harga × Jumlah Penumpang
- **Kendaraan**: Harga sesuai bahasa yang dipilih
- **Total**: Destinasi + Kendaraan

## File yang Diperbaiki

- `app/components/SidebarCart.tsx` - Update `packageOptions` dengan harga yang benar

## Testing

1. **Pilih bahasa Indonesia** - Harga kendaraan tampil dalam Rupiah
2. **Pilih bahasa Inggris** - Harga kendaraan tampil dalam Dollar dengan nominal yang benar
3. **Ubah kendaraan** - Harga ter-update sesuai pilihan
4. **Perhitungan total** - Akurat berdasarkan harga yang dipilih

## Contoh Hasil

### **Bahasa Indonesia (Brio)**
- Harga: Rp 747,500
- Total dengan destinasi: Rp 747,500 + (harga destinasi × penumpang)

### **Bahasa Inggris (Brio)**
- Harga: $44.69  
- Total dengan destinasi: $44.69 + (harga destinasi × penumpang)

Harga kendaraan sekarang sudah 100% sesuai dengan database! 🚗💰
