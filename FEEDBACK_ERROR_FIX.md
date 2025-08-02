# Feedback Error Fix Guide

## 🚨 Error: "Cannot read properties of undefined (reading 'toLowerCase')"

### Penyebab:
Error ini terjadi karena `GEMITRA_FEEDBACK_URL` tidak terdefinisi di environment variables.

### Solusi:

#### 1. Cek Environment Variables
```bash
# Di .env.local, pastikan ada:
GEMITRA_FEEDBACK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

#### 2. Restart Development Server
```bash
# Stop server
Ctrl+C

# Restart
npm run dev
```

#### 3. Test Environment Variable
```javascript
// Di browser console
fetch('/api/feedback', {
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

#### 4. Cek Google Apps Script URL
1. Buka Google Apps Script
2. Copy URL deployment
3. Test URL di browser
4. Pastikan URL benar

#### 5. Setup Google Apps Script
1. Copy `feedback.gs` ke Google Apps Script
2. Update `SPREADSHEET_ID`
3. Deploy sebagai web app
4. Copy URL deployment

#### 6. Setup Google Sheets
1. Buat tab "Feedback"
2. Jalankan `setupFeedbackSpreadsheet()`

### Quick Fix Commands:

```bash
# 1. Restart server
npm run dev

# 2. Test API
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test","email":"test@test.com","pesan":"Test"}'

# 3. Check environment
echo $GEMITRA_FEEDBACK_URL
```

### Debug Steps:

1. **Cek .env.local**
2. **Restart server**
3. **Test API endpoint**
4. **Cek Google Apps Script**
5. **Cek Google Sheets**

### Expected Response:
```json
{
  "success": true,
  "message": "Feedback berhasil dikirim",
  "id": 1
}
```

### Error Response:
```json
{
  "message": "Konfigurasi server tidak lengkap. Silakan hubungi administrator."
}
``` 