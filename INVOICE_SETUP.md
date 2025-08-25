# Setup Fitur Invoice

## Overview
Fitur invoice memungkinkan pengguna untuk melihat detail transaksi berdasarkan kode invoice yang ada di URL. Data diambil dari Google Spreadsheet melalui Google Apps Script.

## Prerequisites
1. Google Spreadsheet dengan sheet "Transaksi"
2. Google Apps Script yang sudah di-deploy
3. Environment variable yang sudah dikonfigurasi

## Setup Google Spreadsheet

### 1. Buat Sheet "Transaksi"
Buat sheet baru dengan nama "Transaksi" dan tambahkan header berikut:

| id | nama | destinasi | penumpang | tanggal_berangkat | waktu_berangkat | kendaraan | total | status | kode | waktu_transaksi | tanggal_transaksi |
|----|------|-----------|-----------|-------------------|-----------------|-----------|-------|--------|------|-----------------|-------------------|

### 2. Contoh Data
```
1 | John Doe | Bali, Lombok | 2 | 2024-01-15 | 08:00 | Toyota Hiace | 1500000 | pending | INV-1703123456789 | 14:30:25 | 2024-01-15
```

## Setup Google Apps Script

### 1. File transaksi.gs
File ini sudah diupdate dengan endpoint `get-transaction` yang diperlukan untuk fitur invoice.

### 2. Deploy Script
1. Buka Google Apps Script
2. Copy paste kode dari `transaksi.gs`
3. Deploy sebagai web app
4. Set permission ke "Anyone"
5. Copy URL deployment

## Setup Environment Variables

### 1. Buat file .env.local
```bash
# Main Google Apps Script URL for invoice and other features
NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 2. Ganti YOUR_SCRIPT_ID
Ganti `YOUR_SCRIPT_ID` dengan ID script yang sudah di-deploy.

## URL Structure

### Format URL yang Didukung:
```
✅ localhost:3000/invoice/INV-1755959054202
```

### Format URL yang Tidak Didukung:
```
❌ localhost:3000//invoice?kode=INV-1755959054202  (double slash)
❌ localhost:3000/invoice?kode=INV-1755959054202  (query parameter)
❌ localhost:3000/api/invoice/INV-1755959054202   (old path)
```

## Data Mapping

### Mapping dari Database ke Invoice:
- **orderNumber** = `kode_invoice` (dari field `kode`)
- **date** = `tanggal_berangkat` + `waktu_berangkat`
- **cashier** = "Online Booking" (fixed value)
- **customerName** = `nama` (dari field `nama`)
- **subtotal** = `total` (dari field `total`)
- **discount** = 0 (fixed value)
- **total** = `total` (dari field `total`)
- **paymentMethod** = "QRIS / Transfer" (fixed value)
- **amountPaid** = `total` (dari field `total`)
- **change** = 0 (fixed value)

## Testing

### 1. Test Endpoint Google Apps Script
Test endpoint dengan URL:
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=get-transaction&kode=INV-1755959054202
```

### 2. Test Halaman Invoice
Akses halaman invoice dengan URL:
```
http://localhost:3000/invoice/INV-1755959054202
```

### 3. Test dengan Script
Jalankan test script:
```bash
node test-invoice-new.js
```

## Troubleshooting

### 1. Invoice Tidak Ditemukan
- Pastikan kode invoice ada di spreadsheet
- Pastikan environment variable sudah benar
- Pastikan Google Apps Script sudah di-deploy

### 2. Error Fetching Data
- Cek console browser untuk error detail
- Pastikan URL Google Apps Script valid
- Pastikan permission script sudah "Anyone"

### 3. Status Tidak Tampil
- Status akan di-normalize otomatis
- `pending` → `⏳ MENUNGGU PEMBAYARAN`
- `lunas` → `✅ LUNAS`
- `batal` → `❌ DIBATALKAN`

### 4. Error 404
- Pastikan menggunakan URL format yang benar: `/invoice/[kode]`
- Jangan gunakan query parameter atau double slash
- Pastikan file routing sudah benar

## Features

### 1. Auto Status Mapping
- Status dari database akan di-normalize otomatis
- Fallback ke status "Pending" jika tidak sesuai

### 2. Responsive Design
- Halaman responsive untuk mobile dan desktop
- Layout yang rapi dan mudah dibaca

### 3. Error Handling
- Menampilkan pesan error yang informatif
- Fallback untuk data yang tidak lengkap

### 4. Data Validation
- Validasi data sebelum ditampilkan
- Error page yang informatif jika data tidak ditemukan

## Security Notes
- Google Apps Script URL bersifat public
- Data transaksi dapat diakses oleh siapapun yang memiliki kode invoice
- Pertimbangkan untuk menambahkan autentikasi jika diperlukan

## File Structure
```
app/
├── invoice/
│   └── [kode]/
│       └── page.tsx          # Halaman invoice utama
├── api/
│   └── invoice/
│       └── [kode]/
│           └── page.tsx      # API endpoint (deprecated)
middleware.ts                  # Middleware untuk redirect
```

## Migration from Old System
Jika sebelumnya menggunakan `/api/invoice/[kode]`, sekarang gunakan:
- **Old**: `localhost:3000/api/invoice/INV-123`
- **New**: `localhost:3000/invoice/INV-123`
