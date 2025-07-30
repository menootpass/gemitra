# Fitur Penambahan Pengunjung Destinasi

## Overview
Fitur ini menambahkan mekanisme otomatis untuk menambah jumlah pengunjung destinasi setiap kali transaksi berhasil dilakukan.

## Implementasi

### 1. API Endpoint Baru
- **File**: `app/api/destinations/route.ts`
- **Method**: `PATCH`
- **Fungsi**: Update jumlah pengunjung destinasi

### 2. Modifikasi Transaksi API
- **File**: `app/api/transactions/route.ts`
- **Fungsi**: Menambah pengunjung setelah transaksi berhasil

### 3. Type Definition
- **File**: `app/types/index.ts`
- **Penambahan**: Field `pengunjung?: number` pada interface `Destination`

## Cara Kerja

### Flow Transaksi:
1. User melakukan transaksi
2. Data transaksi dikirim ke Google Apps Script
3. Jika transaksi berhasil, sistem akan:
   - Mengambil data destinasi untuk mendapatkan ID
   - Mengirim request PATCH untuk menambah pengunjung
   - Update jumlah pengunjung di database

### Request Format:

#### PATCH /api/destinations
```json
{
  "destinasi_id": 123,
  "action": "increment"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Pengunjung berhasil ditambah",
  "pengunjung_baru": 156
}
```

## Google Apps Script Implementation

### 1. Modifikasi doPost untuk handle PATCH
```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Handle transaksi
    if (data.nama && data.destinasi) {
      return handleTransaction(data);
    }
    
    // Handle update pengunjung
    if (data.destinasi_id && data.action) {
      return handleVisitorUpdate(data);
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleVisitorUpdate(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Destinations');
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Cari baris destinasi berdasarkan ID
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.destinasi_id) { // Asumsi ID di kolom A
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Destinasi tidak ditemukan'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Ambil nilai pengunjung saat ini (asumsi di kolom H)
  const currentVisitors = sheet.getRange(rowIndex, 8).getValue() || 0;
  let newVisitors = currentVisitors;
  
  if (data.action === 'increment') {
    newVisitors = currentVisitors + 1;
  } else if (data.action === 'decrement') {
    newVisitors = Math.max(0, currentVisitors - 1);
  }
  
  // Update nilai pengunjung
  sheet.getRange(rowIndex, 8).setValue(newVisitors);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Pengunjung berhasil diupdate',
    pengunjung_baru: newVisitors
  })).setMimeType(ContentService.MimeType.JSON);
}
```

### 2. Struktur Sheet Destinations
Pastikan sheet Destinations memiliki kolom untuk pengunjung:
- Kolom A: ID
- Kolom B: Nama
- Kolom C: Lokasi
- Kolom D: Rating
- Kolom E: Kategori
- Kolom F: Image URL
- Kolom G: Deskripsi
- **Kolom H: Pengunjung** (baru)

## Environment Variables

Pastikan environment variables berikut sudah diset:
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

## Error Handling

- Jika destinasi tidak ditemukan, akan ada warning di console
- Jika update pengunjung gagal, transaksi tetap berhasil tapi ada error log
- Semua error ditangani dengan graceful degradation

## Monitoring

- Log semua update pengunjung di console
- Track jumlah pengunjung per destinasi
- Monitor error rate untuk update pengunjung

## Future Enhancements

1. **Batch Update**: Update multiple destinasi dalam satu request
2. **Analytics**: Dashboard untuk melihat trend pengunjung
3. **Notification**: Notifikasi real-time saat pengunjung bertambah
4. **Validation**: Validasi tambahan untuk mencegah spam 