# Panduan URL Fitur Invoice

## 🎯 URL yang Benar

### Format URL yang Didukung:

#### 1. **Dynamic Route (Direkomendasikan)**
```
localhost:3000/api/invoice/INV-1755959054202
```
- ✅ **Format**: `/api/invoice/[KODE_INVOICE]`
- ✅ **Contoh**: `/api/invoice/INV-1755959054202`
- ✅ **Keuntungan**: SEO friendly, clean URL, Next.js best practice

#### 2. **Query Parameter (Legacy Support)**
```
localhost:3000/invoice?kode=INV-1755959054202
```
- ⚠️ **Format**: `/invoice?kode=[KODE_INVOICE]`
- ⚠️ **Contoh**: `/invoice?kode=INV-1755959054202`
- ⚠️ **Catatan**: Akan di-redirect ke format yang benar

## 🚫 URL yang Salah

### Format yang Tidak Didukung:

#### ❌ **Double Slash**
```
localhost:3000//invoice?kode=INV-1755959054202
```
- **Masalah**: Double slash `//` tidak valid
- **Solusi**: Gunakan single slash `/`

#### ❌ **Path Salah**
```
localhost:3000/invoice/INV-1755959054202
```
- **Masalah**: Path `/invoice/` tidak ada, seharusnya `/api/invoice/`
- **Solusi**: Gunakan `/api/invoice/[KODE]`

#### ❌ **Query Parameter di Dynamic Route**
```
localhost:3000/api/invoice/INV-1755959054202?kode=INV-1755959054202
```
- **Masalah**: Redundant, kode sudah ada di path
- **Solusi**: Hapus query parameter

## 🔄 Redirect Otomatis

Sistem akan otomatis mengalihkan URL format lama ke format yang benar:

```
/invoice?kode=INV-1755959054202
↓ (redirect otomatis)
/api/invoice/INV-1755959054202
```

## 📱 Contoh Penggunaan

### 1. **Link di Email/WhatsApp**
```html
<a href="http://localhost:3000/api/invoice/INV-1755959054202">
  Lihat Invoice
</a>
```

### 2. **Link di Aplikasi**
```javascript
const invoiceUrl = `http://localhost:3000/api/invoice/${kodeInvoice}`;
window.open(invoiceUrl, '_blank');
```

### 3. **Share Link**
```
http://localhost:3000/api/invoice/INV-1755959054202
```

## 🧪 Testing

### Test URL yang Benar:
```bash
# ✅ URL yang benar
curl http://localhost:3000/api/invoice/INV-1755959054202

# ✅ URL dengan redirect
curl http://localhost:3000/invoice?kode=INV-1755959054202
```

### Test URL yang Salah:
```bash
# ❌ Double slash
curl http://localhost:3000//invoice?kode=INV-1755959054202

# ❌ Path salah
curl http://localhost:3000/invoice/INV-1755959054202
```

## 🚀 Best Practices

1. **Gunakan Format Dynamic Route**: `/api/invoice/[KODE]`
2. **Hindari Query Parameter**: Lebih clean dan SEO friendly
3. **Test URL Sebelum Deploy**: Pastikan semua link berfungsi
4. **Update Link Lama**: Ganti semua link yang menggunakan format query parameter

## 🔧 Troubleshooting

### Error 404:
- ✅ Pastikan kode invoice ada di database
- ✅ Pastikan URL menggunakan format yang benar
- ✅ Pastikan Google Apps Script sudah di-deploy
- ✅ Pastikan environment variable sudah dikonfigurasi

### Redirect Loop:
- ✅ Pastikan tidak ada redirect yang circular
- ✅ Pastikan URL target valid dan accessible

## 📝 Contoh Implementasi

### React Component:
```jsx
const InvoiceLink = ({ kode }) => {
  const invoiceUrl = `/api/invoice/${kode}`;
  
  return (
    <a href={invoiceUrl} className="btn btn-primary">
      Lihat Invoice {kode}
    </a>
  );
};
```

### Next.js Link:
```jsx
import Link from 'next/link';

const InvoiceLink = ({ kode }) => (
  <Link href={`/api/invoice/${kode}`}>
    <a className="btn btn-primary">Lihat Invoice {kode}</a>
  </Link>
);
```
