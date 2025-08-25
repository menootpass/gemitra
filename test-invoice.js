// Test script untuk endpoint invoice
// Jalankan dengan: node test-invoice.js

const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // Ganti dengan URL script Anda

async function testInvoiceEndpoint() {
  console.log('🧪 Testing Invoice Endpoint...\n');
  
  // Test 1: Get transaction by kode
  console.log('1. Testing get-transaction endpoint...');
  try {
    const testKode = 'INV-1703123456789'; // Ganti dengan kode yang ada di spreadsheet
    const url = `${SCRIPT_URL}?action=get-transaction&kode=${testKode}`;
    
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('   ✅ Success: Transaction found');
      console.log(`   📋 Customer: ${data.data.nama}`);
      console.log(`   🎯 Destination: ${data.data.destinasi}`);
      console.log(`   💰 Total: Rp ${data.data.total}`);
      console.log(`   📊 Status: ${data.data.status}`);
    } else {
      console.log('   ❌ Failed:', data.message);
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n2. Testing default endpoint (all transactions)...');
  try {
    const url = SCRIPT_URL;
    
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    
    if (data.success) {
      console.log(`   ✅ Success: Found ${data.data.length} transactions`);
      if (data.data.length > 0) {
        const firstTransaction = data.data[0];
        console.log(`   📋 Sample transaction:`);
        console.log(`      - ID: ${firstTransaction.id}`);
        console.log(`      - Customer: ${firstTransaction.nama}`);
        console.log(`      - Code: ${firstTransaction.kode}`);
      }
    } else {
      console.log('   ❌ Failed:', data.message || 'Unknown error');
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n3. Testing invalid kode...');
  try {
    const invalidKode = 'INVALID-KODE-123';
    const url = `${SCRIPT_URL}?action=get-transaction&kode=${invalidKode}`;
    
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
    
    if (!data.success) {
      console.log('   ✅ Expected: Transaction not found');
    } else {
      console.log('   ⚠️  Unexpected: Transaction found with invalid kode');
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n🎯 Test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Ganti YOUR_SCRIPT_ID dengan ID script yang sudah di-deploy');
  console.log('2. Pastikan spreadsheet memiliki data transaksi');
  console.log('3. Jalankan test lagi untuk memverifikasi');
}

// Jalankan test
testInvoiceEndpoint().catch(console.error);
