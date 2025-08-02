# Fix Google Apps Script Errors

## 🚨 Errors:
1. `TypeError: Cannot read properties of undefined (reading 'postData')`
2. `TypeError: output.setHeaders is not a function`

### Penyebab:
- Error 1: Parameter `e` tidak terdefinisi dengan benar
- Error 2: Method `setHeaders` tidak tersedia di `ContentService`

### Solusi:

#### 1. Copy Kode yang Sudah Diperbaiki
File `feedback-clean.gs` sudah diperbaiki dengan:
- ✅ Uncomment `SPREADSHEET_ID` dan `SHEET_NAME`
- ✅ Perbaiki method chaining untuk `ContentService`
- ✅ Hapus variabel `headers` yang tidak diperlukan

#### 2. Update Google Apps Script
1. Buka [Google Apps Script](https://script.google.com)
2. **HAPUS SEMUA KODE** di editor
3. Copy isi `feedback-clean.gs` yang sudah diperbaiki
4. Paste ke editor
5. **Save** (Ctrl+S)

#### 3. Update SPREADSHEET_ID
```javascript
// Ganti dengan ID spreadsheet Anda
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
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

#### A. Uncomment Variables
```javascript
// Sebelum (error)
//const SPREADSHEET_ID = '...';
//const SHEET_NAME = 'Feedback';

// Sesudah (fixed)
const SPREADSHEET_ID = '...';
const SHEET_NAME = 'Feedback';
```

#### B. Fix ContentService Method Chaining
```javascript
// Sebelum (error)
var output = ContentService.createTextOutput(JSON.stringify(result));
output.setMimeType(ContentService.MimeType.JSON);
output.setHeaders(headers);
return output;

// Sesudah (fixed)
return ContentService
  .createTextOutput(JSON.stringify(result))
  .setMimeType(ContentService.MimeType.JSON)
  .setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
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

### Debug Steps:
1. **Clear Google Apps Script editor**
2. **Copy `feedback-clean.gs` yang sudah diperbaiki**
3. **Update SPREADSHEET_ID**
4. **Test setupFeedbackSpreadsheet**
5. **Deploy ulang**
6. **Update environment variable**
7. **Restart server**
8. **Test API**

### Files yang Diperbaiki:
- `feedback-clean.gs` - Versi yang sudah diperbaiki
- `FEEDBACK_SCRIPT_ERROR_FIX.md` - Panduan fix error 