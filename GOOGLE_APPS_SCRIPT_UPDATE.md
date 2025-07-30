# Update Google Apps Script untuk Fitur Penambahan Pengunjung

## Perubahan yang Ditambahkan

### 1. Handler untuk Transaksi
```javascript
// Fungsi untuk menangani transaksi dan menambah pengunjung
function handleTransaction(data) {
  // Generate unique code untuk transaksi
  // Simpan data transaksi ke sheet Transactions
  // Auto increment pengunjung untuk setiap destinasi
}
```

### 2. Handler untuk PATCH Request
```javascript
// Fungsi untuk menangani PATCH request (update pengunjung)
function doPatch(e) {
  const data = JSON.parse(e.postData.contents);
  const result = handleVisitorUpdate(data);
  return ContentService.createTextOutput(JSON.stringify(result));
}
```

### 3. Update Pengunjung berdasarkan ID
```javascript
// Fungsi untuk update pengunjung berdasarkan ID
function handleVisitorUpdate(data) {
  // Cari destinasi berdasarkan ID
  // Update kolom 'dikunjungi' (kolom 10)
  // Return response dengan jumlah pengunjung baru
}
```

### 4. Update Pengunjung berdasarkan Nama
```javascript
// Fungsi untuk menambah pengunjung berdasarkan nama destinasi
function incrementVisitorByName(destinasiName) {
  // Cari destinasi berdasarkan nama
  // Increment kolom 'dikunjungi'
  // Log untuk monitoring
}
```

## Struktur Sheet

### Sheet Destinasi
- **Kolom A**: ID
- **Kolom B**: Nama
- **Kolom C**: Lokasi
- **Kolom D**: Rating
- **Kolom E**: Kategori
- **Kolom F**: Image URL
- **Kolom G**: Deskripsi
- **Kolom H**: Fasilitas
- **Kolom I**: Komentar
- **Kolom J**: Dikunjungi (pengunjung) ← **BARU**
- **Kolom K**: Posisi

### Sheet Transactions
- **Kolom A**: Kode
- **Kolom B**: Nama
- **Kolom C**: Destinasi
- **Kolom D**: Penumpang
- **Kolom E**: Tanggal Berangkat
- **Kolom F**: Waktu Berangkat
- **Kolom G**: Kendaraan
- **Kolom H**: Total
- **Kolom I**: Status
- **Kolom J**: Tanggal Transaksi
- **Kolom K**: Waktu Transaksi

## Request Format

### 1. Transaksi (POST)
```json
{
  "nama": "John Doe",
  "destinasi": "Candi Borobudur, Malioboro",
  "penumpang": 2,
  "tanggal_berangkat": "2024-01-15",
  "waktu_berangkat": "08:00",
  "kendaraan": "Mobilio",
  "total": 500000
}
```

### 2. Update Pengunjung (PATCH)
```json
{
  "destinasi_id": 1,
  "action": "increment"
}
```

## Response Format

### 1. Transaksi Berhasil
```json
{
  "success": true,
  "message": "Transaksi berhasil disimpan",
  "kode": "GEM-ABC123"
}
```

### 2. Update Pengunjung Berhasil
```json
{
  "success": true,
  "message": "Pengunjung berhasil diupdate",
  "pengunjung_baru": 156,
  "destinasi_id": 1,
  "action": "increment"
}
```

### 3. Error Response
```json
{
  "error": "Destinasi tidak ditemukan"
}
```

## Cara Kerja

### Flow Transaksi:
1. **User melakukan transaksi** → POST request dengan data transaksi
2. **Simpan transaksi** → Data disimpan di sheet Transactions
3. **Parse destinasi** → Split destinasi berdasarkan koma
4. **Update pengunjung** → Untuk setiap destinasi, increment pengunjung
5. **Return response** → Kode transaksi dan status

### Flow Update Pengunjung:
1. **PATCH request** → Dengan destinasi_id dan action
2. **Cari destinasi** → Berdasarkan ID di sheet Destinasi
3. **Update pengunjung** → Increment/decrement kolom dikunjungi
4. **Return response** → Jumlah pengunjung baru

## Setup yang Diperlukan

### 1. Jalankan Setup Function
```javascript
// Jalankan sekali untuk setup struktur sheet
function setupSpreadsheet() {
  // Membuat header untuk sheet Destinasi
  // Membuat sheet Transactions jika belum ada
  // Setup header untuk Transactions
}
```

### 2. Deploy sebagai Web App
- Set access to "Anyone"
- Enable necessary APIs
- Copy URL untuk environment variables

### 3. Environment Variables
```env
GEMITRA_TRANSACTIONS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GEMITRA_DESTINATIONS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Testing Functions

### 1. Test Update Comment
```javascript
function testUpdateComment() {
  // Test update komentar
}
```

### 2. Test Update Visitor
```javascript
function testUpdateVisitor() {
  // Test update pengunjung
}
```

## Monitoring & Logging

### Console Logs:
- `Berhasil menambah pengunjung untuk destinasi: [nama] ([jumlah])`
- `Destinasi tidak ditemukan: [nama]`
- `Error saat menambah pengunjung untuk destinasi: [nama]`

### Error Handling:
- Graceful handling untuk destinasi yang tidak ditemukan
- Log warnings untuk debugging
- Proper error responses

## Fitur Baru

### 1. Auto Increment Pengunjung
- Otomatis menambah pengunjung saat transaksi berhasil
- Support multiple destinasi dalam satu transaksi
- Case-insensitive matching untuk nama destinasi

### 2. Manual Update Pengunjung
- PATCH request untuk update manual
- Support increment dan decrement
- Response dengan jumlah pengunjung baru

### 3. Transaction Tracking
- Sheet terpisah untuk transaksi
- Unique code generation
- Timestamp untuk setiap transaksi

## Security Considerations

### 1. Input Validation
- Validasi data sebelum processing
- Sanitasi input untuk mencegah injection

### 2. Error Information
- Tidak expose sensitive information
- Log errors untuk debugging

### 3. Access Control
- Set appropriate access levels
- Monitor usage patterns

## Performance Optimizations

### 1. Batch Operations
- Update multiple destinasi dalam satu transaksi
- Efficient sheet operations

### 2. Caching
- Minimize sheet reads
- Optimize data lookups

### 3. Error Recovery
- Graceful degradation
- Fallback mechanisms

## Status Implementasi

- ✅ Handler untuk transaksi
- ✅ Handler untuk PATCH request
- ✅ Update pengunjung berdasarkan ID
- ✅ Update pengunjung berdasarkan nama
- ✅ Auto increment saat transaksi
- ✅ Setup function untuk struktur sheet
- ✅ Error handling dan logging
- ✅ Testing functions

**Google Apps Script siap untuk fitur penambahan pengunjung!** 🎉 