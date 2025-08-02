# Feedback System Setup Steps

## 📋 Langkah-langkah Setup

### 1. Google Apps Script Setup

#### A. Buat Project Baru
1. Buka [Google Apps Script](https://script.google.com)
2. Klik "New project"
3. Beri nama "Feedback API"

#### B. Copy Script
1. Copy seluruh isi file `feedback.gs`
2. Paste ke Google Apps Script editor
3. Update `SPREADSHEET_ID` dengan ID spreadsheet Anda

#### C. Deploy Script
1. Klik "Deploy" → "New deployment"
2. Pilih "Web app"
3. Set "Execute as": "Me"
4. Set "Who has access": "Anyone"
5. Klik "Deploy"
6. Copy URL deployment

### 2. Google Sheets Setup

#### A. Buat Tab Feedback
1. Buka Google Sheets
2. Buat tab baru bernama "Feedback"
3. Pastikan tab kosong

#### B. Setup Headers
1. Buka Google Apps Script
2. Pilih fungsi `setupFeedbackSpreadsheet`
3. Klik "Run"
4. Cek Google Sheets, headers akan otomatis dibuat

### 3. Environment Variables

#### A. Update .env.local
```env
GEMITRA_FEEDBACK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

#### B. Restart Server
```bash
# Stop server
Ctrl+C

# Restart
npm run dev
```

### 4. Testing

#### A. Test Google Apps Script
1. Buka Google Apps Script
2. Pilih fungsi `doPost`
3. Klik "Run" → "Test function"
4. Masukkan test data:
```json
{
  "nama": "Test User",
  "email": "test@example.com",
  "pesan": "Test feedback"
}
```

#### B. Test Frontend
1. Buka aplikasi di browser
2. Scroll ke section "Berikan Feedback"
3. Isi form dan submit
4. Cek data di Google Sheets

### 5. Troubleshooting

#### A. Error "Unexpected token '<'"
- Cek URL deployment benar
- Pastikan script sudah di-deploy
- Test URL di browser

#### B. Error "Spreadsheet not found"
- Cek SPREADSHEET_ID benar
- Pastikan Google Sheets bisa diakses
- Cek permissions

#### C. Error "Sheet not found"
- Pastikan tab "Feedback" ada
- Jalankan `setupFeedbackSpreadsheet()`

## ✅ Checklist

- [ ] Google Apps Script project dibuat
- [ ] Script di-deploy
- [ ] URL deployment di-copy
- [ ] Google Sheets tab "Feedback" dibuat
- [ ] Headers di-setup
- [ ] Environment variable di-set
- [ ] Server di-restart
- [ ] Test berhasil

## 🚀 Quick Test

```javascript
// Test di browser console
fetch('YOUR_SCRIPT_URL', {
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