# Implementasi Fitur Penambahan Pengunjung Destinasi

## Overview
Fitur ini menambahkan mekanisme otomatis untuk menambah jumlah pengunjung destinasi setiap kali transaksi berhasil dilakukan. Implementasi ini mencakup backend API, frontend UI, dan integrasi dengan Google Apps Script.

## Fitur yang Ditambahkan

### 1. Backend API
- **Endpoint PATCH `/api/destinations`**: Untuk update jumlah pengunjung
- **Modifikasi endpoint POST `/api/transactions`**: Menambah pengunjung setelah transaksi berhasil
- **Type definition**: Field `pengunjung` pada interface `Destination`

### 2. Frontend UI
- **Komponen DestinationDetail**: Menampilkan jumlah pengunjung
- **Halaman detail destinasi**: Menampilkan informasi pengunjung
- **Format angka**: Menggunakan `toLocaleString()` untuk format yang user-friendly

### 3. Google Apps Script
- **Handler untuk PATCH request**: Update pengunjung di spreadsheet
- **Integrasi dengan transaksi**: Otomatis menambah pengunjung setelah transaksi berhasil

## File yang Dimodifikasi

### 1. `app/api/destinations/route.ts`
```typescript
// Menambahkan endpoint PATCH
export async function PATCH(request: Request) {
  // Handle update pengunjung destinasi
}
```

### 2. `app/api/transactions/route.ts`
```typescript
// Menambahkan fungsi incrementDestinationVisitors
async function incrementDestinationVisitors(destinasiNames: string[]): Promise<void> {
  // Logic untuk menambah pengunjung
}
```

### 3. `app/types/index.ts`
```typescript
export interface Destination {
  // ... existing fields
  pengunjung?: number; // Field baru
}
```

### 4. `app/components/DestinationDetail.tsx`
```typescript
// Menambahkan tampilan pengunjung
{destination.pengunjung !== undefined && (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-[#213DFF] font-semibold">👥</span>
    <span className="text-black/70">
      {destination.pengunjung.toLocaleString()} pengunjung
    </span>
  </div>
)}
```

### 5. `app/wisata/[id]/page.tsx`
```typescript
// Menambahkan informasi pengunjung di halaman detail
{data.pengunjung !== undefined && (
  <div className="flex items-center gap-2 text-sm mb-2">
    <span className="text-[#213DFF] font-semibold">👥</span>
    <span className="text-black/70">
      {data.pengunjung.toLocaleString()} pengunjung
    </span>
  </div>
)}
```

## Cara Kerja

### Flow Transaksi:
1. **User melakukan transaksi** → Data dikirim ke `/api/transactions`
2. **Transaksi berhasil** → Data disimpan di Google Apps Script
3. **Auto increment pengunjung** → Sistem mengambil data destinasi
4. **Update pengunjung** → Kirim PATCH request ke Google Apps Script
5. **UI update** → Jumlah pengunjung ditampilkan di frontend

### Error Handling:
- Jika destinasi tidak ditemukan: Warning di console
- Jika update pengunjung gagal: Transaksi tetap berhasil, error di log
- Graceful degradation: Fitur tetap berfungsi meski ada error

## Setup Google Apps Script

### 1. Deploy Script
```javascript
// File: google-apps-script-with-visitor-count.js
// Deploy sebagai web app dengan access: Anyone
```

### 2. Setup Spreadsheet
```javascript
// Jalankan function setupSheets() untuk membuat struktur
function setupSheets() {
  // Membuat sheet Destinations dengan kolom Pengunjung
  // Membuat sheet Transactions
}
```

### 3. Environment Variables
```env
GEMITRA_TRANSACTIONS_URL=https://script.google.com/macros/s/YOUR_TRANSACTIONS_SCRIPT_ID/exec
GEMITRA_DESTINATIONS_URL=https://script.google.com/macros/s/YOUR_DESTINATIONS_SCRIPT_ID/exec
```

## Testing

### 1. Test Transaksi
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Test User",
    "destinasi": "Candi Borobudur",
    "penumpang": 2,
    "tanggal_berangkat": "2024-01-15",
    "kendaraan": "Mobilio"
  }'
```

### 2. Test Update Pengunjung
```bash
curl -X PATCH http://localhost:3000/api/destinations \
  -H "Content-Type: application/json" \
  -d '{
    "destinasi_id": 1,
    "action": "increment"
  }'
```

## Monitoring & Logging

### Console Logs:
- `Berhasil menambah pengunjung untuk destinasi: [nama]`
- `Gagal menambah pengunjung untuk destinasi: [nama]`
- `Destinasi tidak ditemukan: [nama]`

### Error Handling:
- Transaksi tetap berhasil meski update pengunjung gagal
- Warning untuk destinasi yang tidak ditemukan
- Fallback ke nilai default jika data tidak ada

## Performance Considerations

### 1. Caching
- Data destinasi di-cache untuk mengurangi API calls
- Fallback ke cache expired jika API gagal

### 2. Batch Operations
- Update pengunjung dilakukan secara asynchronous
- Tidak memblokir response transaksi

### 3. Error Recovery
- Graceful degradation jika fitur pengunjung gagal
- Transaksi tetap berhasil meski ada error

## Future Enhancements

### 1. Analytics Dashboard
- Grafik trend pengunjung per destinasi
- Statistik popularitas destinasi
- Export data untuk analisis

### 2. Real-time Updates
- WebSocket untuk update real-time
- Notifikasi saat pengunjung bertambah
- Live counter di UI

### 3. Advanced Features
- Filter berdasarkan jumlah pengunjung
- Sorting destinasi berdasarkan popularitas
- Badge untuk destinasi populer

## Troubleshooting

### 1. Pengunjung tidak bertambah
- Cek console log untuk error
- Pastikan Google Apps Script sudah di-deploy
- Verifikasi environment variables

### 2. Transaksi gagal
- Cek network tab untuk error API
- Pastikan data yang dikirim lengkap
- Verifikasi format data

### 3. UI tidak update
- Refresh halaman untuk melihat perubahan
- Cek apakah data pengunjung ada di response API
- Pastikan field `pengunjung` ada di data destinasi

## Security Considerations

### 1. Input Validation
- Validasi data sebelum dikirim ke Google Apps Script
- Sanitasi input untuk mencegah injection

### 2. Rate Limiting
- Implementasi rate limiting untuk mencegah spam
- Validasi jumlah request per user

### 3. Error Information
- Tidak expose sensitive information di error message
- Log error untuk debugging tanpa expose ke user

## Dependencies

### Required Environment Variables:
```env
GEMITRA_TRANSACTIONS_URL=your_transactions_script_url
GEMITRA_DESTINATIONS_URL=your_destinations_script_url
```

### Google Apps Script Setup:
- Deploy script sebagai web app
- Set access to "Anyone"
- Enable necessary APIs

## Conclusion

Fitur penambahan pengunjung telah berhasil diimplementasikan dengan:
- ✅ Backend API untuk update pengunjung
- ✅ Frontend UI untuk menampilkan pengunjung
- ✅ Integrasi dengan transaksi
- ✅ Error handling yang robust
- ✅ Dokumentasi lengkap

Fitur ini siap digunakan dan dapat dikembangkan lebih lanjut sesuai kebutuhan. 