# Feedback System Debug Guide

## 🚨 Error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

### Langkah-langkah Debugging:

### 1. Cek Google Apps Script Deployment
1. Buka [Google Apps Script](https://script.google.com)
2. Pilih project feedback Anda
3. Klik "Deploy" → "Manage deployments"
4. Pastikan ada deployment yang aktif
5. Copy URL deployment

### 2. Test URL Deployment
```javascript
// Test di browser console
fetch('YOUR_SCRIPT_URL')
  .then(response => response.text())
  .then(data => console.log('Response:', data))
  .catch(error => console.error('Error:', error));
```

### 3. Cek Environment Variable
```bash
# Di .env.local
GEMITRA_FEEDBACK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 4. Test Google Apps Script Langsung
1. Buka Google Apps Script editor
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

### 5. Setup Google Sheets
1. Buka Google Sheets
2. Buat tab baru bernama "Feedback"
3. Jalankan fungsi `setupFeedbackSpreadsheet()` di Google Apps Script

### 6. Restart Development Server
```bash
# Stop server
Ctrl+C

# Restart
npm run dev
```

## 🔧 Quick Fix

Jika masih error, coba:

1. **Clear cache browser**
2. **Restart development server**
3. **Test URL deployment di browser**
4. **Cek Google Apps Script logs**

## 📞 Support

Siapkan informasi berikut:
- Error message lengkap
- Google Apps Script URL
- Environment variable value
- Network tab screenshot 