# SidebarCart Pricing Fix

## Masalah yang Diperbaiki

### 1. **Harga Destinasi Tidak Sesuai**
- **Masalah**: Saat bahasa Inggris dipilih, mata uang sudah dollar ($) tapi nominalnya masih menggunakan harga lokal (IDR)
- **Contoh**: Plunyon Kalikuning menampilkan "$13,000" padahal seharusnya "$1.20" (mancanegara)

### 2. **Perhitungan Harga Tidak Jelas**
- **Masalah**: Harga per item dan total tidak ditampilkan dengan jelas
- **Solusi**: Menampilkan format "harga × jumlah = total"

## Perbaikan yang Dilakukan

### 1. **Display Harga Destinasi**
```typescript
// Sebelum
{formatPrice(getCartItemPriceByLanguage(item, locale), locale)}

// Sesudah  
{formatPrice(itemPrice, locale)} × {jumlahPenumpang} = {formatPrice(totalItemPrice, locale)}
```

### 2. **Perhitungan Harga yang Benar**
```typescript
const itemPrice = getCartItemPriceByLanguage(item, locale);
const totalItemPrice = itemPrice * jumlahPenumpang;
```

## Data Harga yang Benar

### **Plunyon Kalikuning**
- **IDR**: Rp 13,000
- **USD**: $1.20 (mancanegara: 1.195814648729447)

### **Museum Ullen Sentalu**
- **IDR**: Rp 55,000  
- **USD**: $1.20 (mancanegara: 1.195814648729447)

### **Batu Alien**
- **IDR**: Rp 6,000
- **USD**: $1.20 (mancanegara: 1.195814648729447)

### **Goa Jomblang**
- **IDR**: Rp 501,000
- **USD**: $29.90 (mancanegara: 29.90)

### **Candi Prambanan**
- **IDR**: Rp 400,000
- **USD**: $23.92 (mancanegara: 23.92)

### **Desa Wisata Wukirsari**
- **IDR**: Rp 15,000
- **USD**: $0.90 (mancanegara: 0.8968609865470852)

## Hasil

### **Bahasa Indonesia**
- Menampilkan harga dalam Rupiah (Rp)
- Contoh: "Rp 13,000 × 2 = Rp 26,000"

### **Bahasa Inggris**
- Menampilkan harga dalam Dollar ($)
- Contoh: "$1.20 × 2 = $2.40"

## File yang Diperbaiki

- `app/components/SidebarCart.tsx` - Perbaikan display harga destinasi

## Testing

1. **Pilih bahasa Indonesia** - Harga tampil dalam Rupiah
2. **Pilih bahasa Inggris** - Harga tampil dalam Dollar dengan nominal yang benar
3. **Ubah jumlah penumpang** - Perhitungan otomatis update
4. **Tambah/hapus destinasi** - Total cost ter-update dengan benar

Harga destinasi sekarang sudah sesuai dengan data mancanegara! 💰
