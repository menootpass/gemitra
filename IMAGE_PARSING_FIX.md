# Fix Image Parsing Issues

## 🚨 Error: `Failed to parse src "[https://drive.google.com/uc?export=view&id=1oe8R7nbiDAi2gu3-SP6HDCY_H73aYQaH]" on next/image`

### Penyebab:
Error ini terjadi karena format data gambar dari database tidak diparse dengan benar. Database menyimpan gambar dalam format array seperti:
```
[https://drive.google.com/uc?export=view&id=1oe8R7nbiDAi2gu3-SP6HDCY_H73aYQaH, https://drive.google.com/uc?export=view&id=1ogOWNfqW7LmFF8kPhiXGGiTkuk8glTsl]
```

### Solusi:

#### 1. Perbaiki Fungsi `processImageData`
Fungsi ini sudah diperbaiki di semua file:
- ✅ `app/wisata/page.tsx`
- ✅ `app/wisata/[id]/page.tsx`
- ✅ `app/components/DestinationDetail.tsx`
- ✅ `app/hooks/useDestinations.ts`
- ✅ `app/hooks/useDestinationsSWR.ts`

#### 2. Fitur yang Ditambahkan:
- ✅ Parsing JSON array string
- ✅ Cleaning karakter kontrol
- ✅ Regex extraction untuk URL
- ✅ Manual parsing dengan split comma
- ✅ Handling quotes dalam array
- ✅ Fallback untuk single URL
- ✅ Google Drive URL detection

#### 3. Format yang Didukung:
```javascript
// Format 1: Array langsung
["url1", "url2", "url3"]

// Format 2: JSON string
'["url1", "url2", "url3"]'

// Format 3: Array string dengan quotes
'["https://drive.google.com/uc?export=view&id=1", "https://drive.google.com/uc?export=view&id=2"]'

// Format 4: Array string tanpa quotes
'[https://drive.google.com/uc?export=view&id=1, https://drive.google.com/uc?export=view&id=2]'

// Format 5: Single URL
"https://drive.google.com/uc?export=view&id=1"
```

### Perubahan yang Dibuat:

#### A. Enhanced Image Processing
```javascript
const processImageData = (d: any) => {
  if (!d.img) return null;
  
  // If img is already an array, return the whole array
  if (Array.isArray(d.img) && d.img.length > 0) {
    return d.img;
  }
  
  // If img is a string, it might be a JSON array string
  if (typeof d.img === 'string') {
    // Try to parse as JSON array first
    try {
      const parsed = JSON.parse(d.img);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // If JSON parsing fails, try to clean the string first
      try {
        const cleaned = d.img.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e2) {
        // Failed to parse even after cleaning
      }
    }
    
    // Check if it looks like an array string (starts with [ and ends with ])
    if (d.img.startsWith('[') && d.img.endsWith(']')) {
      try {
        // Try to extract URLs from the string manually
        const urlMatches = d.img.match(/https?:\/\/[^\s,\]]+/g);
        if (urlMatches && urlMatches.length > 0) {
          return urlMatches;
        }
      } catch (e) {
        // Failed to extract URLs
      }
      
      // If regex extraction fails, try manual parsing
      try {
        // Remove brackets and split by comma
        const content = d.img.slice(1, -1); // Remove [ and ]
        const urls = content.split(',').map((url: string) => url.trim().replace(/"/g, ''));
        const validUrls = urls.filter((url: string) => url.startsWith('http'));
        if (validUrls.length > 0) {
          return validUrls;
        }
      } catch (e) {
        // Failed manual extraction
      }
      
      // Additional parsing for array format like [url1, url2]
      try {
        // Remove brackets and split by comma, handling quotes
        const content = d.img.slice(1, -1); // Remove [ and ]
        const urls = content.split(',').map((url: string) => {
          const trimmed = url.trim();
          // Remove quotes if present
          return trimmed.replace(/^["']|["']$/g, '');
        });
        const validUrls = urls.filter((url: string) => url.startsWith('http'));
        if (validUrls.length > 0) {
          return validUrls;
        }
      } catch (e) {
        // Failed additional parsing
      }
    }
    
    // If it's a valid URL, return it as array
    if (d.img.startsWith('http://') || d.img.startsWith('https://')) {
      return [d.img];
    }
    // Check if it's a Google Drive URL format (even without http/https)
    if (d.img.includes('drive.google.com')) {
      return [d.img];
    }
    // If it looks like a URL but doesn't start with http/https, try to fix it
    if (d.img.includes('.com') || d.img.includes('.org') || d.img.includes('.net')) {
      return [`https://${d.img}`];
    }
    return null;
  }
  
  return null;
};
```

#### B. Update ImageSlider Usage
```javascript
// Sebelum (error)
<ImageSlider 
  images={Array.isArray(item.img) ? item.img : (item.img ? [item.img] : [])}
  alt={item.nama}
  className="w-full h-full"
/>

// Sesudah (fixed)
<ImageSlider 
  images={processImageData(item) || []}
  alt={item.nama}
  className="w-full h-full"
/>
```

### Test Cases:

#### A. Test dengan Format Database
```javascript
// Test data dari database
const testData = {
  img: '[https://drive.google.com/uc?export=view&id=1oe8R7nbiDAi2gu3-SP6HDCY_H73aYQaH, https://drive.google.com/uc?export=view&id=1ogOWNfqW7LmFF8kPhiXGGiTkuk8glTsl]'
};

// Expected result
const expected = [
  'https://drive.google.com/uc?export=view&id=1oe8R7nbiDAi2gu3-SP6HDCY_H73aYQaH',
  'https://drive.google.com/uc?export=view&id=1ogOWNfqW7LmFF8kPhiXGGiTkuk8glTsl'
];
```

#### B. Test dengan Berbagai Format
```javascript
// Format 1: JSON array
const test1 = '["url1", "url2"]';

// Format 2: Array string
const test2 = '[url1, url2]';

// Format 3: Single URL
const test3 = 'https://example.com/image.jpg';

// Format 4: Google Drive URL
const test4 = 'https://drive.google.com/uc?export=view&id=123';
```

### Expected Result:
- ✅ Gambar akan ditampilkan dengan benar
- ✅ ImageSlider akan menampilkan multiple images
- ✅ Tidak ada error parsing
- ✅ Fallback untuk format yang tidak valid

### Files yang Diperbaiki:
- `app/wisata/page.tsx` - Enhanced processImageData function
- `app/wisata/[id]/page.tsx` - Fixed ImageSlider usage
- `app/components/DestinationDetail.tsx` - Added processImageData function
- `app/hooks/useDestinations.ts` - Enhanced image parsing
- `app/hooks/useDestinationsSWR.ts` - Enhanced image parsing
- `IMAGE_PARSING_FIX.md` - Panduan fix parsing

### Catatan Penting:
- ✅ Fungsi parsing gambar sudah robust
- ✅ Mendukung berbagai format database
- ✅ Fallback untuk format yang tidak valid
- ✅ Google Drive URL detection
- ✅ Error handling yang baik 