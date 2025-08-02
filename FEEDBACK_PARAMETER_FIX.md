# Fix Parameter Validation Error

## 🚨 Error: `TypeError: Cannot read properties of undefined (reading 'postData')`

### Penyebab:
Error ini terjadi karena parameter `e` tidak terdefinisi dengan benar saat Google Apps Script dipanggil.

### Solusi:

#### 1. Copy Kode yang Sudah Diperbaiki
File `feedback-clean.gs` sudah diperbaiki dengan:
- ✅ Tambah validasi parameter `e` di semua fungsi
- ✅ Cek `e.postData.contents` sebelum digunakan
- ✅ Cek `e.parameter.id` untuk DELETE request
- ✅ Return error response yang jelas jika parameter tidak valid

#### 2. Update Google Apps Script
1. Buka [Google Apps Script](https://script.google.com)
2. **HAPUS SEMUA KODE** di editor
3. Copy isi `feedback-clean.gs` yang sudah diperbaiki
4. Paste ke editor
5. **Save** (Ctrl+S)

#### 3. Update SPREADSHEET_ID
```javascript
// Ganti dengan ID spreadsheet Anda
const FEEDBACK_SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

#### 4. Test Script
1. Pilih fungsi `setupFeedbackSpreadsheet`
2. Klik "Run"
3. Cek Google Sheets, headers akan dibuat

#### 5. Deploy Ulang
1. Klik "Deploy" → "New deployment"
2. Pilih "Web app"
3. Set "Execute as": "Me"
4. Set "Who has access": "Anyone"
5. Klik "Deploy"
6. Copy URL deployment baru

#### 6. Update Environment Variable
```env
# Di .env.local
GEMITRA_FEEDBACK_URL=https://script.google.com/macros/s/NEW_SCRIPT_ID/exec
```

#### 7. Restart Development Server
```bash
npm run dev
```

### Perubahan yang Dibuat:

#### A. Tambah Validasi Parameter
```javascript
// Sebelum (error)
console.log('doPost called with:', e.postData.contents);

// Sesudah (fixed)
if (!e || !e.postData || !e.postData.contents) {
  console.error('Invalid request parameters:', e);
  return ContentService
    .createTextOutput(JSON.stringify({ 
      error: 'Invalid request parameters',
      message: 'Parameter request tidak valid'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
console.log('doPost called with:', e.postData.contents);
```

#### B. Validasi untuk DELETE Request
```javascript
// Sebelum (error)
const id = Number(e.parameter.id);

// Sesudah (fixed)
if (!e || !e.parameter || !e.parameter.id) {
  console.error('Invalid request parameters:', e);
  return ContentService
    .createTextOutput(JSON.stringify({ 
      error: 'Invalid request parameters',
      message: 'Parameter request tidak valid'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
const id = Number(e.parameter.id);
```

### Test Script:

#### A. Test di Google Apps Script
```javascript
// Pilih fungsi setupFeedbackSpreadsheet dan klik Run
// Cek Google Sheets, harus ada headers baru
```

#### B. Test Deployment
```javascript
// Di browser console
fetch('YOUR_NEW_SCRIPT_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nama: 'Test',
    email: 'test@test.com',
    pesan: 'Test'
  })
})
.then(r => r.text())
.then(console.log)
.catch(console.error);
```

#### C. Test API Route
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test","email":"test@test.com","pesan":"Test"}'
```

### Expected Result:
```json
{
  "success": true,
  "message": "Feedback berhasil dikirim",
  "id": 1
}
```

### Error Response (jika parameter tidak valid):
```json
{
  "error": "Invalid request parameters",
  "message": "Parameter request tidak valid"
}
```

### Debug Steps:
1. **Clear Google Apps Script editor**
2. **Copy `feedback-clean.gs` yang sudah diperbaiki**
3. **Update FEEDBACK_SPREADSHEET_ID**
4. **Test setupFeedbackSpreadsheet**
5. **Deploy ulang**
6. **Update environment variable**
7. **Restart server**
8. **Test API**

### Files yang Diperbaiki:
- `feedback-clean.gs` - Versi dengan validasi parameter
- `FEEDBACK_PARAMETER_FIX.md` - Panduan fix parameter

### Catatan Penting:
- Google Apps Script memerlukan validasi parameter yang ketat
- Selalu cek `e.postData.contents` sebelum digunakan
- Selalu cek `e.parameter.id` untuk DELETE request
- Return error response yang jelas jika parameter tidak valid 