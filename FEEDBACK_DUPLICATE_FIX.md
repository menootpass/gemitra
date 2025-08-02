# Fix Duplicate Identifier Error

## 🚨 Error: "Identifier 'SPREADSHEET_ID' has already been declared"

### Penyebab:
Error ini terjadi karena ada duplikasi deklarasi variabel di Google Apps Script editor.

### Solusi:

#### 1. Clear Google Apps Script Editor
1. Buka [Google Apps Script](https://script.google.com)
2. Pilih project feedback Anda
3. **HAPUS SEMUA KODE** di editor
4. Copy isi `feedback-clean.gs` (file baru yang bersih)
5. Paste ke editor

#### 2. Update SPREADSHEET_ID
```javascript
// Ganti dengan ID spreadsheet Anda
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

#### 3. Deploy Ulang
1. Klik "Deploy" → "Manage deployments"
2. Klik "New deployment"
3. Pilih "Web app"
4. Set "Execute as": "Me"
5. Set "Who has access": "Anyone"
6. Klik "Deploy"
7. Copy URL deployment baru

#### 4. Update Environment Variable
```env
# Di .env.local
GEMITRA_FEEDBACK_URL=https://script.google.com/macros/s/NEW_SCRIPT_ID/exec
```

#### 5. Restart Development Server
```bash
# Stop server
Ctrl+C

# Restart
npm run dev
```

### Langkah-langkah Detail:

#### A. Clear dan Reset Google Apps Script
1. Buka Google Apps Script
2. **Select All** (Ctrl+A)
3. **Delete** semua kode
4. Copy `feedback-clean.gs`
5. Paste ke editor
6. **Save** (Ctrl+S)

#### B. Test Script
1. Pilih fungsi `setupFeedbackSpreadsheet`
2. Klik "Run"
3. Cek Google Sheets, headers akan dibuat

#### C. Test Deployment
1. Deploy sebagai web app
2. Copy URL deployment
3. Test di browser:
```javascript
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

### Quick Fix Commands:

```bash
# 1. Restart server
npm run dev

# 2. Test API
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test","email":"test@test.com","pesan":"Test"}'
```

### Debug Steps:

1. **Clear Google Apps Script editor**
2. **Copy `feedback-clean.gs`**
3. **Update SPREADSHEET_ID**
4. **Deploy ulang**
5. **Update environment variable**
6. **Restart server**
7. **Test API**

### Expected Result:

```json
{
  "success": true,
  "message": "Feedback berhasil dikirim",
  "id": 1
}
```

### Files yang Dibuat:
- `feedback-clean.gs` - Versi bersih tanpa duplikasi
- `FEEDBACK_DUPLICATE_FIX.md` - Panduan fix duplikasi 