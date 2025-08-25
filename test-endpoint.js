// test-endpoint.js
// Script untuk test Google Apps Script endpoint

const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // ⚠️ IMPORTANT: Ganti YOUR_SCRIPT_ID

async function testEndpoint() {
  console.log('🧪 Testing Google Apps Script Endpoint...\n');

  if (SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
    console.log('❌ ERROR: Anda belum mengganti YOUR_SCRIPT_ID dengan ID script yang benar!');
    console.log('\n📋 Langkah-langkah:');
    console.log('1. Copy kode dari gemitra-app-script.gs ke Google Apps Script');
    console.log('2. Deploy sebagai web app dengan permission "Anyone"');
    console.log('3. Copy URL deployment dan ganti YOUR_SCRIPT_ID');
    console.log('4. Jalankan script ini lagi');
    return;
  }

  try {
    // Test 1: Get transaction by kode
    console.log('🔍 Test 1: Get Transaction by Kode');
    const testKode = 'INV-1755959054202';
    const getTransactionUrl = `${SCRIPT_URL}?action=get-transaction&kode=${testKode}`;
    
    console.log(`URL: ${getTransactionUrl}`);
    
    const response1 = await fetch(getTransactionUrl);
    const data1 = await response1.json();
    
    console.log(`Status: ${response1.status}`);
    console.log('Response:', JSON.stringify(data1, null, 2));
    
    if (data1.success) {
      console.log('✅ Test 1 BERHASIL: Transaksi ditemukan');
    } else {
      console.log('❌ Test 1 GAGAL: Transaksi tidak ditemukan');
    }
    
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get all transactions
    console.log('🔍 Test 2: Get All Transactions');
    const getAllUrl = SCRIPT_URL;
    
    console.log(`URL: ${getAllUrl}`);
    
    const response2 = await fetch(getAllUrl);
    const data2 = await response2.json();
    
    console.log(`Status: ${response2.status}`);
    console.log('Response:', JSON.stringify(data2, null, 2));
    
    if (data2.success && Array.isArray(data2.data)) {
      console.log(`✅ Test 2 BERHASIL: Ditemukan ${data2.data.length} transaksi`);
    } else {
      console.log('❌ Test 2 GAGAL: Tidak bisa mengambil semua transaksi');
    }

  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Pastikan Google Apps Script sudah di-deploy');
    console.log('2. Pastikan permission set ke "Anyone"');
    console.log('3. Pastikan URL deployment benar');
    console.log('4. Cek logs di Google Apps Script dashboard');
  }
}

// Jalankan test
testEndpoint().catch(console.error);
