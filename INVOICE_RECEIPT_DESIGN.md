# Desain Invoice Struk Belanja

## Perubahan yang Dilakukan

### 1. Layout Struk Belanja
**Sebelum:**
- Layout card besar dengan banyak ruang kosong
- Background gradient biru
- Max width 4xl (896px)
- Padding besar dan margin besar

**Sesudah:**
- Layout struk belanja compact
- Background abu-abu sederhana
- Max width sm (384px) - seperti struk belanja
- Padding dan margin minimal

### 2. Header Struk
```typescript
<div className="bg-white shadow-lg p-4 mb-3">
  <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
    <h1 className="text-xl font-bold text-gray-800 mb-1">
      GEMITRA TOUR
    </h1>
    <p className="text-xs text-gray-600">
      Tour & Travel Service
    </p>
    <p className="text-xs text-gray-500 mt-1">
      Jl. Malioboro No. 123, Yogyakarta
    </p>
    <p className="text-xs text-gray-500">
      Telp: (0274) 123456
    </p>
  </div>
  
  <div className="text-center">
    <div className="text-sm font-bold text-gray-800 mb-1">
      INVOICE
    </div>
    <div className="text-xs font-semibold text-[#16A86E] mb-2">
      #{invoice.kode}
    </div>
    <div className={`inline-block px-2 py-1 text-xs font-semibold border ${getStatusStyle(normalizedStatus)}`}>
      {getStatusText(normalizedStatus)}
    </div>
  </div>
</div>
```

### 3. Detail Struk
```typescript
<div className="bg-white shadow-lg p-4 mb-3">
  <div className="border-b border-gray-200 pb-2 mb-2">
    <div className="flex justify-between text-xs">
      <span className="text-gray-600">Tanggal:</span>
      <span className="font-semibold">{formatDate(invoice.tanggal_transaksi)}</span>
    </div>
    <div className="flex justify-between text-xs">
      <span className="text-gray-600">Waktu:</span>
      <span className="font-semibold">{invoice.waktu_transaksi}</span>
    </div>
  </div>

  <div className="space-y-1 text-xs">
    <div className="flex justify-between">
      <span className="text-gray-600">Nama:</span>
      <span className="font-semibold text-right max-w-[60%] break-words">{invoice.nama}</span>
    </div>
    // ... detail lainnya
  </div>
</div>
```

### 4. Rincian Pembayaran
```typescript
<div className="bg-white shadow-lg p-4 mb-3">
  <div className="border-b border-gray-200 pb-2 mb-2">
    <div className="text-xs font-semibold text-gray-800">RINCIAN PEMBAYARAN</div>
  </div>
  
  <div className="space-y-1 text-xs">
    {/* Destinations */}
    {destinasiItems.map((item, index) => (
      <div key={index} className="flex justify-between">
        <span className="text-gray-600 break-words max-w-[60%]">{item.nama}</span>
        <span className="font-semibold">
          {formatPrice(
            locale === 'en' ? getDestinationInternationalPrice(item.slug) : item.harga,
            locale
          )}
        </span>
      </div>
    ))}
    
    {/* Vehicle */}
    <div className="flex justify-between">
      <span className="text-gray-600">Kendaraan</span>
      <span className="font-semibold">
        {formatPrice(
          locale === 'en' ? getVehicleInternationalPrice(invoice.kendaraan, hargaMobil) : hargaMobil,
          locale
        )}
      </span>
    </div>
  </div>
  
  <div className="border-t border-gray-200 pt-2 mt-2">
    <div className="flex justify-between text-sm font-bold">
      <span>TOTAL:</span>
      <span className="text-[#16A86E]">
        {formatPrice(totalByLanguage, locale)}
      </span>
    </div>
  </div>
</div>
```

### 5. QR Code Struk
```typescript
<div className="bg-white shadow-lg p-4 mb-3">
  <div className="text-center">
    <div className="text-xs font-semibold text-gray-800 mb-2">KONFIRMASI PEMBAYARAN</div>
    <QRCodeGenerator message={whatsappMessage} />
    <p className="text-xs text-gray-600 mt-2">
      Scan QR Code untuk konfirmasi pembayaran
    </p>
  </div>
</div>
```

### 6. Footer Struk
```typescript
<div className="bg-white shadow-lg p-4">
  <div className="text-center">
    <p className="text-xs font-semibold text-gray-800 mb-1">TERIMA KASIH</p>
    <p className="text-xs text-gray-500">
      Sampai jumpa di petualangan berikutnya
    </p>
    <div className="border-t border-gray-200 mt-2 pt-2">
      <p className="text-xs text-gray-400">
        Powered by Gemitra Tour
      </p>
    </div>
  </div>
</div>
```

## Karakteristik Struk Belanja

### 1. Ukuran Compact
- Max width: 384px (sm)
- Padding minimal: p-4
- Margin kecil: mb-3

### 2. Typography Kecil
- Header: text-xl
- Subtitle: text-xs
- Content: text-xs
- Total: text-sm

### 3. Layout Vertikal
- Setiap section dalam card terpisah
- Border dashed untuk header
- Border solid untuk separator

### 4. Warna Sederhana
- Background: gray-100
- Card: white dengan shadow-lg
- Text: gray-800, gray-600, gray-500
- Accent: green untuk total dan status

### 5. QR Code Kecil
- Size: 150x150 (dari 200x200)
- Border: border-green-300
- Margin: mb-2

## Hasil

Invoice sekarang terlihat seperti struk belanja yang:
- ✅ Compact dan mudah dibaca
- ✅ Sesuai untuk mobile dan desktop
- ✅ Professional dan clean
- ✅ Mudah di-print
- ✅ QR Code untuk konfirmasi pembayaran
- ✅ Informasi lengkap dalam format struk

## Testing

1. **Buka invoice** di browser
2. **Periksa layout** - harus compact seperti struk
3. **Test responsive** - harus bagus di mobile
4. **Test QR Code** - harus bisa di-scan
5. **Test print** - harus rapi saat di-print

Invoice sekarang memiliki tampilan struk belanja yang professional! 🧾
