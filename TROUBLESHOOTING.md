# Troubleshooting Gemitra App

## Error 401: Authentication Failed

### Penyebab
Error 401 terjadi karena:
1. Environment variables tidak dikonfigurasi
2. Username/password salah
3. SheetDB tidak mendukung basic auth untuk endpoint ini

### Solusi

#### 1. Setup Environment Variables
Buat file `.env.local` di root project:
```env
NEXT_PUBLIC_SHEETDB_USERNAME=your_actual_username
NEXT_PUBLIC_SHEETDB_PASSWORD=your_actual_password
```

#### 2. Restart Development Server
Setelah membuat `.env.local`, restart server:
```bash
npm run dev
```

#### 3. Check Auth Status
- Lihat komponen AuthStatus di halaman utama
- Jika kuning: auth belum dikonfigurasi
- Jika hijau: auth sudah dikonfigurasi

#### 4. Fallback Mechanism
Aplikasi sudah memiliki fallback:
- Jika auth gagal (401), akan mencoba tanpa auth
- Jika masih gagal, akan menggunakan cache expired
- Jika tidak ada cache, akan menampilkan error

### Debug Steps

#### 1. Check Console Logs
Buka browser console dan lihat log:
```
API Service initialized with auth: { hasUsername: true, hasPassword: true, baseUrl: "..." }
Using Basic Auth with credentials
```

#### 2. Check Network Tab
- Buka Developer Tools > Network
- Lihat request ke SheetDB
- Check response status dan headers

#### 3. Test API Directly
Coba akses langsung di browser:
```
https://sheetdb.io/api/v1/7ske65b4rjfi4
```

## Error Lainnya

### Error 403: Forbidden
- SheetDB mungkin memerlukan authentication
- Pastikan credentials benar
- Cek apakah endpoint memerlukan auth

### Error 404: Not Found
- URL API salah
- SheetDB ID tidak valid
- Cek konfigurasi baseUrl

### Error 500: Server Error
- Masalah di server SheetDB
- Coba lagi nanti
- Check SheetDB status

## Cache Issues

### Cache Tidak Berfungsi
1. **Check Cache Stats**: Lihat di CacheControl component
2. **Clear Cache**: Klik "Clear Local" atau "Purge Cache"
3. **Check Console**: Lihat log cache operations

### Data Tidak Update
1. **Purge Cache**: Klik "Purge Cache" untuk clear server cache
2. **Refresh**: Klik "Coba Lagi" di error message
3. **Check SheetDB**: Pastikan data sudah diupdate di Google Sheets

## Performance Issues

### Loading Lambat
1. **Check Cache**: Pastikan cache berfungsi
2. **Network**: Cek koneksi internet
3. **SheetDB**: Cek response time dari SheetDB

### API Calls Terlalu Banyak
1. **Enable Cache**: Pastikan `enableCache: true`
2. **Check Cache Duration**: Default 5 menit
3. **Monitor Network**: Lihat di Network tab

## Environment Variables

### NEXT_PUBLIC_ Prefix
- Variables harus diawali `NEXT_PUBLIC_` untuk client-side
- Tanpa prefix hanya tersedia di server-side

### File Locations
- `.env.local`: Local development (git ignored)
- `.env.example`: Template untuk dokumentasi
- `.env`: Production (jangan commit)

### Restart Required
- Setelah mengubah `.env.local`, restart dev server
- Hot reload tidak akan reload environment variables

## SheetDB Configuration

### Basic Auth
- Username dan password dari SheetDB
- Bisa diatur di dashboard SheetDB
- Endpoint: `https://sheetdb.io/api/v1/YOUR_ID`

### Cache Purge
- URL: `https://sheetdb.io/api/v1/YOUR_ID/cache/purge/TOKEN`
- Token dari SheetDB dashboard
- Method: POST

### Rate Limiting
- SheetDB memiliki rate limit
- Cache membantu mengurangi API calls
- Monitor usage di dashboard

## Development Tips

### Debug Mode
- Buka console untuk melihat log
- Check Network tab untuk API calls
- Monitor cache statistics

### Testing
1. **Without Auth**: Hapus credentials untuk test public access
2. **With Auth**: Tambah credentials untuk test protected access
3. **Cache Test**: Clear cache dan monitor API calls

### Monitoring
- Cache hit/miss ratio
- API response times
- Error rates
- User experience metrics

## Common Solutions

### 1. Auth Not Working
```bash
# Restart dev server
npm run dev

# Check .env.local exists
ls -la .env.local

# Verify variables
echo $NEXT_PUBLIC_SHEETDB_USERNAME
```

### 2. Cache Issues
```javascript
// Clear cache manually
apiService.clearCache();

// Check cache stats
console.log(apiService.getCacheStats());
```

### 3. API Issues
```javascript
// Test API directly
fetch('https://sheetdb.io/api/v1/7ske65b4rjfi4')
  .then(res => res.json())
  .then(data => console.log(data));
```

## Support

Jika masalah masih berlanjut:
1. Check SheetDB documentation
2. Verify API endpoint dan credentials
3. Test dengan Postman atau curl
4. Contact SheetDB support jika diperlukan 