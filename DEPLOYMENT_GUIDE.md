# 🚀 Panduan Deployment Google Apps Script

## 📋 **Langkah-langkah Deployment:**

### **1. Buka Google Apps Script**
- Buka [script.google.com](https://script.google.com)
- Login dengan akun Google Anda

### **2. Buat Project Baru**
- Klik "New Project"
- Beri nama: `Gemitra App Script`
- Hapus semua kode default

### **3. Copy Paste Kode**
- Copy semua kode dari file `gemitra-app-script.gs`
- Paste ke editor Google Apps Script

### **4. Setup Sheet Transaksi**
- Jalankan fungsi `setupTransaksiSheet()` dari editor
- Klik tombol ▶️ (Run) di sebelah fungsi
- Authorize jika diminta
- Cek console untuk konfirmasi

### **5. Deploy sebagai Web App**
- Klik tombol "Deploy" → "New deployment"
- Pilih "Web app"
- Set konfigurasi:
  - **Execute as**: `Me`
  - **Who has access**: `Anyone`
- Klik "Deploy"

### **6. Copy URL Deployment**
- Setelah deploy, copy URL yang muncul
- Format: `https://script.google.com/macros/s/[SCRIPT_ID]/exec`

### **7. Update Environment Variable**
Buat file `.env.local` di root project:
```bash
NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL=https://script.google.com/macros/s/[SCRIPT_ID]/exec
```

Ganti `[SCRIPT_ID]` dengan ID dari URL deployment.

## 🧪 **Testing:**

### **1. Test Endpoint Langsung**
```
https://script.google.com/macros/s/[SCRIPT_ID]/exec?action=get-transaction&kode=INV-1755959054202
```

### **2. Test dengan Script**
```bash
node test-endpoint.js
```

### **3. Test Halaman Invoice**
```
localhost:3000/invoice/INV-1755959054202
```

## 🔧 **Troubleshooting:**

### **Error: "Sheet Transaksi tidak ditemukan"**
- Pastikan sheet "Transaksi" ada di spreadsheet
- Jalankan fungsi `setupTransaksiSheet()`

### **Error: "Permission denied"**
- Pastikan permission set ke "Anyone"
- Re-deploy script

### **Error: "Function not found"**
- Pastikan semua fungsi ada di script
- Refresh halaman deployment

### **Data tidak muncul**
- Cek apakah kode invoice ada di spreadsheet
- Cek console browser untuk error detail

## 📊 **Struktur Spreadsheet:**

### **Sheet "Transaksi" harus memiliki kolom:**
| id | nama | destinasi | penumpang | tanggal_berangkat | waktu_berangkat | kendaraan | total | status | kode | waktu_transaksi | tanggal_transaksi |
|----|------|-----------|-----------|-------------------|-----------------|-----------|-------|--------|------|-----------------|-------------------|

### **Contoh Data:**
```
1 | John Doe | Bali, Lombok | 2 | 2024-01-15 | 08:00 | Toyota Hiace | 1500000 | pending | INV-1755959054202 | 21:24:14 | 2025-08-23
```

## 🎯 **Endpoint yang Tersedia:**

### **GET /exec?action=get-transaction&kode=[KODE]**
- Mengambil transaksi berdasarkan kode
- Response: `{ success: true, data: {...} }`

### **GET /exec**
- Mengambil semua transaksi
- Response: `{ success: true, data: [...] }`

### **POST /exec**
- Membuat transaksi baru
- Body: `{ action: "create-transaction", ... }`

## ✅ **Checklist Deployment:**

- [ ] Kode sudah di-copy ke Google Apps Script
- [ ] Fungsi `setupTransaksiSheet()` sudah dijalankan
- [ ] Script sudah di-deploy sebagai web app
- [ ] Permission set ke "Anyone"
- [ ] URL deployment sudah di-copy
- [ ] Environment variable sudah diupdate
- [ ] Development server sudah di-restart
- [ ] Endpoint sudah di-test
- [ ] Halaman invoice sudah di-test

## 🚨 **Penting:**

1. **Jangan share URL deployment** ke publik tanpa autentikasi
2. **Monitor usage** di Google Apps Script dashboard
3. **Backup kode** secara berkala
4. **Test semua endpoint** sebelum production

## 📞 **Support:**

Jika masih ada masalah:
1. Cek console browser (F12)
2. Cek logs di Google Apps Script
3. Test endpoint langsung di browser
4. Pastikan semua checklist sudah ✅
