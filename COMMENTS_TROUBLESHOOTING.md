# Troubleshooting Komentar Display

## Masalah yang Ditemukan
Komentar berhasil disimpan ke database dan muncul real-time, tapi saat refresh hilang dan komentar lainnya tidak muncul.

## Analisis Masalah

### 1. **Format Data Komentar**
Data komentar dari database dalam format JSON string:
```json
[{"nama":"okoko","komentar":"brottt","tanggal":"2025-07-26T03:24:38.035Z"},{"nama":"okok","komentar":"oakwaowkwao","tanggal":"2025-07-26T03:34:22.517Z"}]
```

### 2. **Masalah yang Terjadi**
- ✅ Komentar baru berhasil disimpan ke database
- ✅ Komentar baru muncul real-time
- ❌ Saat refresh, komentar hilang
- ❌ Komentar lama tidak muncul

## Solusi yang Diterapkan

### 1. **Perbaikan Parsing Komentar**
```typescript
// Update local comments when data changes
useEffect(() => {
  if (data && data.komentar) {
    // Pastikan komentar adalah array dan format yang benar
    let comments = data.komentar;
    
    console.log('Raw comments from data:', comments);
    console.log('Type of comments:', typeof comments);
    
    // Jika komentar adalah string JSON, parse dulu
    if (typeof comments === 'string') {
      try {
        comments = JSON.parse(comments);
        console.log('Parsed comments:', comments);
      } catch (error) {
        console.error('Error parsing comments:', error);
        comments = [];
      }
    }
    
    // Pastikan comments adalah array
    if (Array.isArray(comments)) {
      console.log('Setting local comments:', comments);
      setLocalComments(comments);
    } else {
      console.warn('Comments is not an array:', comments);
      setLocalComments([]);
    }
  } else {
    console.log('No comments data, setting empty array');
    setLocalComments([]);
  }
}, [data]);
```

### 2. **Enhanced Debugging di Hook**
```typescript
komentar: rawData.komentar ? (() => {
  try {
    const parsed = JSON.parse(rawData.komentar);
    console.log('Parsed comments in hook:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error parsing comments in hook:', error);
    return [];
  }
})() : [],
```

### 3. **Perbaikan Tampilan Komentar**
```typescript
<span className="font-bold text-[#16A86E]">{k.nama}:</span> {k.komentar}
```

## Testing Checklist

### 1. **Test Load Komentar Existing**
1. Buka halaman destinasi yang sudah ada komentar
2. Refresh halaman
3. Verifikasi komentar lama muncul
4. Cek console log untuk debugging

### 2. **Test Add New Comment**
1. Tambah komentar baru
2. Verifikasi komentar muncul real-time
3. Refresh halaman
4. Verifikasi komentar baru masih ada

### 3. **Test Multiple Comments**
1. Tambah beberapa komentar
2. Refresh halaman
3. Verifikasi semua komentar muncul
4. Cek format tanggal dan nama

## Debugging Steps

### 1. **Cek Console Log**
```javascript
// Buka browser developer tools
// Lihat console untuk log:
// - "Raw comments from data:"
// - "Type of comments:"
// - "Parsed comments:"
// - "Setting local comments:"
```

### 2. **Cek Network Tab**
1. Buka Network tab di developer tools
2. Refresh halaman
3. Cari request ke API destinations
4. Periksa response data komentar

### 3. **Cek Database**
1. Buka Google Sheets
2. Periksa kolom komentar
3. Pastikan format JSON valid

## Expected Behavior

### 1. **Saat Load Halaman**
- Komentar dari database di-parse dengan benar
- `localComments` di-set dengan array komentar
- Semua komentar ditampilkan dengan format yang benar

### 2. **Saat Add Comment**
- Komentar baru ditambahkan ke `localComments`
- Komentar muncul real-time dengan animasi
- Toast notification muncul

### 3. **Saat Refresh**
- Data di-load ulang dari database
- Komentar di-parse dan ditampilkan
- Semua komentar (lama + baru) muncul

## Troubleshooting Commands

### 1. **Cek Data di Console**
```javascript
// Di browser console
console.log('Data:', data);
console.log('Local Comments:', localComments);
```

### 2. **Test JSON Parsing**
```javascript
// Test parsing komentar
const testComments = '[{"nama":"test","komentar":"test","tanggal":"2025-07-26T03:24:38.035Z"}]';
console.log(JSON.parse(testComments));
```

### 3. **Force Refresh Data**
```javascript
// Di browser console
refresh();
```

## Common Issues & Solutions

### 1. **Komentar Tidak Muncul Setelah Refresh**
- **Cause**: Parsing error atau data tidak ter-load
- **Solution**: Cek console log dan network request

### 2. **Format Tanggal Salah**
- **Cause**: Invalid date string
- **Solution**: Pastikan format tanggal ISO string

### 3. **Komentar Duplikat**
- **Cause**: State management issue
- **Solution**: Cek key prop di map function

### 4. **Performance Issue**
- **Cause**: Re-render berlebihan
- **Solution**: Optimize useEffect dependencies

## Monitoring

### 1. **Console Logs**
- Monitor parsing errors
- Track data flow
- Debug state changes

### 2. **Network Requests**
- Monitor API calls
- Check response data
- Verify data format

### 3. **User Feedback**
- Test real user scenarios
- Monitor error reports
- Track user experience

Dengan perbaikan ini, komentar seharusnya bisa ditampilkan dengan benar baik saat load awal maupun setelah refresh! 🚀 