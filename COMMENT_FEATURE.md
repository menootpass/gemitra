# Fitur Komentar dengan Validasi Kode Invoice

## Deskripsi
Fitur ini memungkinkan pengguna untuk menambahkan komentar pada destinasi wisata dengan validasi kode invoice. Pengguna harus memiliki kode invoice yang valid dari transaksi sebelumnya untuk dapat menambahkan komentar.

## Komponen yang Ditambahkan

### 1. CommentForm Component
**File**: `app/components/CommentForm.tsx`

**Fitur**:
- Form input untuk kode invoice
- Textarea untuk komentar
- **Nama pengguna diambil otomatis dari database**
- Validasi form real-time
- Loading state saat submit
- Pesan sukses/error
- Integrasi dengan API service

**Props**:
- `destinationId`: ID destinasi wisata
- `onCommentAdded`: Callback function untuk refresh komentar

### 2. Comments API Endpoint
**File**: `app/api/comments/route.ts`

**Fitur**:
- Validasi kode invoice terhadap database transaksi
- Validasi nama pengguna dengan data transaksi
- Update komentar ke database destinasi
- Error handling yang komprehensif

**Endpoint**: `POST /api/comments`

**Request Body**:
```json
{
  "invoiceCode": "string",
  "komentar": "string",
  "destinationId": "number"
}
```

**Response**:
```json
{
  "message": "Komentar berhasil ditambahkan",
  "comment": {
    "nama": "string",
    "komentar": "string",
    "tanggal": "string"
  }
}
```

### 3. API Service Update
**File**: `app/services/api.ts`

**Method Baru**:
```typescript
async postComment(commentData: {
  invoiceCode: string;
  komentar: string;
  destinationId: number;
}): Promise<any>
```

### 4. Types Update
**File**: `app/types/index.ts`

**Perubahan**:
- `Comment` interface: `rating` menjadi optional

## Cara Kerja

### 1. Validasi Invoice Code
- Sistem mengambil data transaksi dari Google Apps Script
- Mencocokkan kode invoice yang dimasukkan dengan data transaksi
- Memvalidasi status transaksi harus 'success'
- **Nama pengguna diambil otomatis dari database transaksi**

### 2. Penyimpanan Komentar
- Komentar disimpan dalam format JSON array
- Setiap komentar memiliki: nama, komentar, tanggal
- Data disimpan ke database destinasi melalui Google Apps Script

### 3. Format Data Komentar
```json
[
  {
    "nama": "Dina",
    "komentar": "Aplikasinya keren banget, sangat membantu tugas harian!",
    "tanggal": "2024-01-15T10:30:00.000Z"
  },
  {
    "nama": "Rizal",
    "komentar": "User interface-nya ramah banget, mudah dipakai.",
    "tanggal": "2024-01-15T11:45:00.000Z"
  }
]
```

## Environment Variables

Tambahkan variabel berikut ke `.env.local`:

```env
# Google Apps Script URLs
GEMITRA_DESTINATIONS_URL=https://script.google.com/macros/s/YOUR_DESTINATIONS_SCRIPT_ID/exec
GEMITRA_TRANSACTIONS_URL=https://script.google.com/macros/s/YOUR_TRANSACTIONS_SCRIPT_ID/exec
```

## Integrasi dengan Halaman Destinasi

**File**: `app/wisata/[id]/page.tsx`

**Perubahan**:
- Import CommentForm component
- Tambahkan CommentForm di bawah daftar komentar
- Integrasi dengan refresh function untuk update komentar

## Error Handling

### 1. Validasi Input
- Semua field wajib diisi
- Pesan error yang informatif

### 2. Validasi Invoice
- Kode invoice tidak valid
- Nama pengguna tidak sesuai
- Transaksi tidak ditemukan

### 3. Server Error
- Gagal mengambil data transaksi
- Gagal mengambil data destinasi
- Gagal menyimpan komentar

## UI/UX Features

### 1. Form Design
- Clean dan modern design
- Responsive layout
- Focus states yang jelas
- Loading spinner saat submit

### 2. Feedback System
- Success message hijau
- Error message merah
- Auto-clear form setelah sukses
- Real-time validation

### 3. Accessibility
- Proper labels untuk screen readers
- Keyboard navigation support
- ARIA attributes

## Testing

### 1. Validasi Invoice
- Test dengan kode invoice valid
- Test dengan kode invoice invalid
- Test dengan nama pengguna tidak sesuai

### 2. Form Validation
- Test submit tanpa mengisi field
- Test dengan data valid
- Test dengan data invalid

### 3. Error Scenarios
- Test network error
- Test server error
- Test database error

## Security Considerations

### 1. Input Validation
- Sanitasi input user
- Validasi tipe data
- Length validation

### 2. Authentication
- Validasi kode invoice
- Validasi nama pengguna
- Rate limiting (future enhancement)

### 3. Data Protection
- Tidak menyimpan data sensitif
- Logging minimal
- Error messages tidak expose internal details

## Future Enhancements

### 1. Rate Limiting
- Batasi jumlah komentar per user
- Cooldown period antar komentar

### 2. Moderation
- Auto-filter komentar spam
- Manual approval system
- Report inappropriate comments

### 3. Rich Comments
- Upload gambar
- Rating system
- Reply to comments

### 4. Analytics
- Track comment engagement
- Popular destinations
- User feedback trends 