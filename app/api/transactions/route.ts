import { NextResponse } from 'next/server';

const SCRIPT_URL = process.env.GEMITRA_TRANSACTIONS_URL!;
const DESTINATIONS_URL = process.env.GEMITRA_DESTINATIONS_URL!;

// Fungsi untuk generate kode unik
function generateUniqueCode(): string {
  return `GEM-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

// Fungsi untuk menambah pengunjung destinasi
async function incrementDestinationVisitors(destinasiNames: string[]): Promise<void> {
  try {
    console.log('🚀 Mulai increment pengunjung untuk destinasi:', destinasiNames);
    
    // Ambil data destinasi untuk mendapatkan ID berdasarkan nama
    console.log('📡 Mengambil data destinasi dari:', DESTINATIONS_URL);
    const destinationsResponse = await fetch(DESTINATIONS_URL);
    
    if (!destinationsResponse.ok) {
      console.error('❌ Gagal mengambil data destinasi:', destinationsResponse.status, destinationsResponse.statusText);
      return;
    }

    const destinationsData = await destinationsResponse.json();
    console.log('📊 Data destinasi yang diterima:', destinationsData);
    
    const destinations = destinationsData.data || destinationsData;
    console.log('🔍 Jumlah destinasi yang ditemukan:', destinations.length);

    // Untuk setiap destinasi dalam transaksi, tambah pengunjung
    for (const destinasiName of destinasiNames) {
      console.log(`🔎 Mencari destinasi: "${destinasiName}"`);
      
      const destination = destinations.find((d: any) => {
        const match = d.nama && d.nama.toLowerCase() === destinasiName.toLowerCase();
        console.log(`  - "${d.nama}" === "${destinasiName}" = ${match}`);
        return match;
      });

      if (destination) {
        console.log(`✅ Destinasi ditemukan:`, destination);
        console.log(`🆔 ID destinasi: ${destination.id}`);
        
        // Update pengunjung destinasi menggunakan Google Apps Script langsung
        const updatePayload = {
          destinasi_id: destination.id,
          action: 'increment'
        };
        
        console.log('📤 Mengirim PATCH request dengan payload:', updatePayload);
        
        const updateResponse = await fetch(DESTINATIONS_URL, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });

        console.log('📥 Response status:', updateResponse.status);
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error(`❌ Gagal menambah pengunjung untuk destinasi: ${destinasiName}`);
          console.error(`   Status: ${updateResponse.status}`);
          console.error(`   Error: ${errorText}`);
        } else {
          const responseData = await updateResponse.json();
          console.log(`✅ Berhasil menambah pengunjung untuk destinasi: ${destinasiName}`);
          console.log(`   Response:`, responseData);
        }
      } else {
        console.warn(`⚠️ Destinasi tidak ditemukan: "${destinasiName}"`);
        console.log('   Daftar destinasi yang tersedia:', destinations.map((d: any) => d.nama));
      }
    }
  } catch (error) {
    console.error('💥 Error saat menambah pengunjung destinasi:', error);
    console.error('   Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📝 Data transaksi yang diterima:', body);

    // Validasi data dasar
    if (!body.nama || !body.destinasi || !body.penumpang || !body.tanggal_berangkat || !body.kendaraan) {
      console.error('❌ Data tidak lengkap:', body);
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    // Siapkan payload untuk dikirim ke Google Apps Script
    const payload = {
      ...body,
      status: 'success',
      kode: generateUniqueCode(),
      tanggal_transaksi: new Date().toISOString(),
      waktu_transaksi: new Date().toISOString(),
    };

    console.log('📤 Mengirim transaksi ke Google Apps Script:', SCRIPT_URL);
    console.log('📦 Payload:', payload);

    // Kirim data ke Google Apps Script
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status dari Google Apps Script:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Apps Script Error:', errorText);
        throw new Error(`Gagal mengirim data ke Google Apps Script: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Transaksi berhasil:', data);

    // Tambah pengunjung untuk setiap destinasi dalam transaksi
    const destinasiNames = body.destinasi.split(', ').map((d: string) => d.trim());
    console.log('👥 Destinasi yang akan di-increment:', destinasiNames);
    
    await incrementDestinationVisitors(destinasiNames);

    return NextResponse.json(data);

  } catch (error) {
    console.error('💥 Error di API route (transactions):', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server', error: errorMessage },
      { status: 500 }
    );
  }
} 