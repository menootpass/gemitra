# Feedback System Setup Guide

## 📋 Overview
Sistem feedback yang profesional untuk mengumpulkan pendapat dan saran dari pengguna Gemitra.

## 🗄️ Database Structure

### Google Sheets - Tab "Feedback"
```
| id | nama | email | telepon | kategori | rating | pesan | status | timestamp |
|----|------|-------|---------|----------|--------|-------|--------|-----------|
| 1  | John | john@email.com | 081234567890 | umum | 5 | Bagus sekali! | pending | 2024-01-01T10:00:00Z |
```

### Kolom Database:
- **id**: Auto increment (Primary Key)
- **nama**: Nama lengkap pengirim feedback
- **email**: Email pengirim (wajib)
- **telepon**: Nomor telepon (opsional)
- **kategori**: Kategori feedback (umum, layanan, destinasi, website, saran, keluhan)
- **rating**: Rating 1-5 bintang
- **pesan**: Isi feedback
- **status**: Status feedback (pending, processed, completed)
- **timestamp**: Waktu pengiriman feedback

## 🚀 Setup Instructions

### 1. Google Apps Script Setup
1. Buka Google Apps Script
2. Buat project baru
3. Copy paste isi `feedback.gs` ke editor
4. Update `SPREADSHEET_ID` dengan ID spreadsheet Anda
5. Deploy sebagai web app
6. Copy URL deployment

### 2. Environment Variables
Tambahkan ke `.env.local`:
```env
GEMITRA_FEEDBACK_URL=https://script.google.com/macros/s/YOUR_FEEDBACK_SCRIPT_ID/exec
```

### 3. Database Setup
1. Buka Google Sheets
2. Buat tab baru bernama "Feedback"
3. Jalankan fungsi `setupFeedbackSpreadsheet()` di Google Apps Script
4. Header akan otomatis dibuat

### 4. Testing
1. Buka halaman utama
2. Scroll ke section "Berikan Feedback"
3. Isi form dan submit
4. Cek data di Google Sheets

## 🎨 Features

### ✅ Form Features:
- **Nama Lengkap**: Input text dengan validasi
- **Email**: Input email dengan format validation
- **Telepon**: Input tel (opsional)
- **Kategori**: Dropdown dengan 6 kategori
- **Rating**: 5-star rating system
- **Pesan**: Textarea untuk feedback detail
- **Submit**: Button dengan loading state

### ✅ Validation:
- Email format validation
- Required field validation
- Rating validation (min 1 star)
- Server-side validation

### ✅ UI/UX:
- Modern design dengan gradient
- Responsive layout
- Loading states
- Success/error messages
- Professional styling

### ✅ Backend:
- Google Apps Script API
- Data validation
- Error handling
- Auto timestamp
- Status tracking

## 📱 Responsive Design

### Desktop (lg+):
- 3-column layout
- Info cards di sidebar
- Form di 2 kolom

### Mobile/Tablet:
- Single column layout
- Stacked info cards
- Full-width form

## 🎯 Categories

1. **Umum**: Feedback umum
2. **Layanan**: Feedback tentang layanan
3. **Destinasi**: Feedback tentang destinasi
4. **Website**: Feedback tentang website
5. **Saran & Ide**: Saran dan ide baru
6. **Keluhan**: Keluhan dan masalah

## 🔧 Customization

### Styling:
- Update colors di `FeedbackForm.tsx`
- Modify layout di `page.tsx`
- Adjust spacing dan typography

### Categories:
- Edit options di `FeedbackForm.tsx`
- Update Google Apps Script untuk handle kategori baru

### Validation:
- Modify validation rules di `api/feedback/route.ts`
- Update client-side validation di `FeedbackForm.tsx`

## 📊 Analytics

### Data yang bisa dianalisis:
- Rating distribution
- Category popularity
- Response time
- User satisfaction trends
- Common feedback themes

### Export Options:
- Google Sheets export
- CSV download
- API integration

## 🛠️ Troubleshooting

### Common Issues:
1. **Script URL Error**: Pastikan URL deployment benar
2. **CORS Error**: Enable CORS di Google Apps Script
3. **Validation Error**: Cek format email dan required fields
4. **Database Error**: Pastikan tab "Feedback" ada

### Debug Steps:
1. Check browser console
2. Verify environment variables
3. Test Google Apps Script directly
4. Check Google Sheets permissions

## 🚀 Deployment

### Production Checklist:
- [ ] Update environment variables
- [ ] Test form submission
- [ ] Verify data storage
- [ ] Check responsive design
- [ ] Test validation rules
- [ ] Monitor error logs

## 📞 Support

Untuk bantuan teknis:
- Email: support@gemitra.com
- WhatsApp: +62 812-3456-7890
- Jam kerja: Senin - Jumat 08:00 - 17:00