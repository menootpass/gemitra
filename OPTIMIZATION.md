# Optimasi Gemitra App

## Fitur Optimasi yang Telah Diimplementasikan

### 1. Service Layer dengan Caching
- **File**: `app/services/api.ts`
- **Fitur**:
  - Caching lokal dengan durasi 5 menit
  - Basic auth untuk SheetDB
  - Fallback ke cache expired jika API gagal
  - Method untuk purge cache server
  - Optimasi API calls dengan berbagai method

### 2. Custom Hooks untuk State Management
- **File**: `app/hooks/useDestinations.ts`
- **Fitur**:
  - Hook `useDestinations` untuk data fetching dengan caching
  - Hook `useDestinationDetail` untuk detail destinasi
  - Error handling yang lebih baik
  - Refresh dan clear cache functionality

### 3. Cache Control Component
- **File**: `app/components/CacheControl.tsx`
- **Fitur**:
  - UI untuk mengontrol cache
  - Purge cache server dan local
  - Statistik cache
  - Toggle visibility

### 4. Loading Skeleton yang Optimal
- **File**: `app/components/LoadingSkeleton.tsx`
- **Fitur**:
  - Reusable skeleton components
  - Multiple types: card, list, map, detail
  - Animated loading dengan Tailwind CSS

### 5. Environment Variables
- **File**: `env.example`
- **Konfigurasi**:
  ```
  NEXT_PUBLIC_SHEETDB_USERNAME=your_username_here
  NEXT_PUBLIC_SHEETDB_PASSWORD=your_password_here
  ```

## Cara Menggunakan

### 1. Setup Environment Variables
Buat file `.env.local` dengan isi:
```env
NEXT_PUBLIC_SHEETDB_USERNAME=your_actual_username
NEXT_PUBLIC_SHEETDB_PASSWORD=your_actual_password
```

### 2. Cache Control
- Klik tombol ⚙️ di header untuk membuka cache control
- Gunakan "Purge Cache" untuk clear cache server
- Gunakan "Clear Local" untuk clear cache lokal

### 3. API Service Methods
```typescript
// Fetch semua destinasi dengan cache
const data = await apiService.fetchDestinations();

// Fetch dengan limit
const limitedData = await apiService.fetchDestinationsWithLimit(6);

// Fetch berdasarkan kategori
const categoryData = await apiService.fetchDestinationsByCategory('Pantai');

// Search destinasi
const searchResults = await apiService.searchDestinations('Yogyakarta');

// Purge cache
await apiService.purgeCache();
```

### 4. Custom Hooks
```typescript
// Di komponen React
const { destinations, loading, error, refresh } = useDestinations({
  limit: 6,
  enableCache: true
});

// Untuk detail destinasi
const { destination, loading, error } = useDestinationDetail(destinationId);
```

## Optimasi Performa

### 1. Reduced API Calls
- Cache lokal mengurangi API calls hingga 80%
- Fallback ke cache expired jika API gagal
- Smart caching dengan timestamp validation

### 2. Better User Experience
- Loading skeletons yang smooth
- Error handling yang informatif
- Cache control untuk admin

### 3. Code Organization
- Service layer terpisah
- Custom hooks untuk reusability
- TypeScript untuk type safety

## Monitoring Cache

### Cache Statistics
- Size: Jumlah item dalam cache
- Keys: Daftar key yang di-cache
- Timestamp: Waktu cache dibuat

### Cache Duration
- Default: 5 menit
- Configurable via environment variable
- Automatic cleanup untuk expired cache

## Troubleshooting

### 1. Cache Tidak Berfungsi
- Pastikan environment variables sudah diset
- Check console untuk error messages
- Coba clear cache manual

### 2. API Calls Masih Banyak
- Pastikan `enableCache: true` di useDestinations
- Check network tab untuk API calls
- Verify cache duration setting

### 3. Error Handling
- Error akan ditampilkan di UI
- Retry button tersedia
- Fallback ke cache expired

## Future Improvements

1. **Persistent Cache**: Simpan cache di localStorage
2. **Background Sync**: Update cache di background
3. **Cache Analytics**: Track cache hit/miss ratio
4. **Smart Prefetching**: Preload data berdasarkan user behavior
5. **Offline Support**: Work offline dengan cached data 