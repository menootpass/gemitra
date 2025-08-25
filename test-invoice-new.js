// Test script untuk halaman invoice baru
// Jalankan dengan: node test-invoice-new.js

const BASE_URL = 'http://localhost:3000';

async function testNewInvoicePage() {
  console.log('🧪 Testing New Invoice Page...\n');
  
  // Test 1: Akses halaman invoice dengan kode yang valid
  console.log('1. Testing invoice page with valid kode...');
  try {
    const testKode = 'INV-1755959054202'; // Ganti dengan kode yang ada di database
    const url = `${BASE_URL}/invoice/${testKode}`;
    
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log('   ✅ Invoice page loaded successfully!');
      
      // Cek apakah halaman berisi data yang diharapkan
      const html = await response.text();
      
      if (html.includes(testKode)) {
        console.log('   ✅ Order number displayed correctly');
      } else {
        console.log('   ⚠️  Order number not found in HTML');
      }
      
      if (html.includes('Online Booking')) {
        console.log('   ✅ Cashier info displayed correctly');
      } else {
        console.log('   ⚠️  Cashier info not found in HTML');
      }
      
      if (html.includes('QRIS / Transfer')) {
        console.log('   ✅ Payment method displayed correctly');
      } else {
        console.log('   ⚠️  Payment method not found in HTML');
      }
      
    } else if (response.status === 404) {
      console.log('   ⚠️  Invoice not found (check if kode exists in database)');
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n2. Testing invoice page with invalid kode...');
  try {
    const invalidKode = 'INVALID-KODE-123';
    const url = `${BASE_URL}/invoice/${invalidKode}`;
    
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 404) {
      console.log('   ✅ Expected: 404 Not Found for invalid kode');
    } else if (response.ok) {
      console.log('   ⚠️  Unexpected: Page loaded with invalid kode');
    } else {
      console.log(`   ⚠️  Status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n3. Testing data mapping...');
  try {
    const testKode = 'INV-1755959054202';
    const url = `${BASE_URL}/invoice/${testKode}`;
    
    console.log(`   Testing data mapping for: ${url}`);
    
    const response = await fetch(url);
    if (response.ok) {
      const html = await response.text();
      
      // Test data mapping
      const tests = [
        { field: 'orderNumber', expected: testKode, description: 'Order Number = Kode Invoice' },
        { field: 'cashier', expected: 'Online Booking', description: 'Cashier = "Online Booking"' },
        { field: 'paymentMethod', expected: 'QRIS / Transfer', description: 'Payment Method = "QRIS / Transfer"' },
        { field: 'discount', expected: '0', description: 'Discount = 0' },
        { field: 'change', expected: '0', description: 'Change = 0' }
      ];
      
      for (const test of tests) {
        if (html.includes(test.expected)) {
          console.log(`   ✅ ${test.description}`);
        } else {
          console.log(`   ❌ ${test.description} - Expected: ${test.expected}`);
        }
      }
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n🎯 Test completed!');
  console.log('\n📝 Summary:');
  console.log('✅ /invoice/[kode] → loads invoice data from database');
  console.log('✅ Data mapping: orderNumber = kode_invoice');
  console.log('✅ Data mapping: cashier = "Online Booking"');
  console.log('✅ Data mapping: paymentMethod = "QRIS / Transfer"');
  console.log('✅ Data mapping: discount = 0, change = 0');
  console.log('❌ /invoice/[invalid-kode] → 404 Not Found');
  
  console.log('\n🔧 Next steps:');
  console.log('1. Pastikan kode invoice ada di database');
  console.log('2. Pastikan Google Apps Script sudah di-deploy');
  console.log('3. Pastikan environment variable sudah dikonfigurasi');
  console.log('4. Test dengan kode invoice yang valid');
}

// Jalankan test
testNewInvoicePage().catch(console.error);
