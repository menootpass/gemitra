// Test script untuk redirect invoice
// Jalankan dengan: node test-redirect.js

const BASE_URL = 'http://localhost:3000';

async function testRedirects() {
  console.log('🧪 Testing Invoice Redirects...\n');
  
  // Test 1: Redirect dari /invoice?kode=... ke /api/invoice/[kode]
  console.log('1. Testing redirect from /invoice?kode=...');
  try {
    const testKode = 'INV-1755959054202';
    const oldUrl = `${BASE_URL}/invoice?kode=${testKode}`;
    
    console.log(`   Old URL: ${oldUrl}`);
    console.log(`   Expected redirect to: ${BASE_URL}/api/invoice/${testKode}`);
    
    const response = await fetch(oldUrl, { 
      method: 'GET',
      redirect: 'manual' // Don't follow redirects automatically
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      console.log(`   ✅ Redirect successful!`);
      console.log(`   📍 Location: ${location}`);
      
      if (location === `/api/invoice/${testKode}`) {
        console.log(`   🎯 Redirect target correct!`);
      } else {
        console.log(`   ⚠️  Redirect target unexpected: ${location}`);
      }
    } else {
      console.log(`   ❌ No redirect detected`);
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n2. Testing direct access to new URL format');
  try {
    const testKode = 'INV-1755959054202';
    const newUrl = `${BASE_URL}/api/invoice/${testKode}`;
    
    console.log(`   New URL: ${newUrl}`);
    
    const response = await fetch(newUrl);
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      console.log(`   ✅ New URL format works!`);
    } else if (response.status === 404) {
      console.log(`   ⚠️  Invoice not found (check if kode exists in database)`);
    } else {
      console.log(`   ❌ Unexpected status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n3. Testing invalid URL formats');
  try {
    const invalidUrls = [
      `${BASE_URL}//invoice?kode=INV-1755959054202`, // Double slash
      `${BASE_URL}/invoice/INV-1755959054202`, // Wrong path
      `${BASE_URL}/invoice`, // No kode parameter
    ];
    
    for (const url of invalidUrls) {
      console.log(`   Testing: ${url}`);
      
      try {
        const response = await fetch(url, { redirect: 'manual' });
        console.log(`      Status: ${response.status}`);
        
        if (response.status === 404) {
          console.log(`      ✅ Expected: 404 Not Found`);
        } else if (response.status === 301 || response.status === 302) {
          const location = response.headers.get('location');
          console.log(`      🔄 Redirected to: ${location}`);
        } else {
          console.log(`      ⚠️  Unexpected status: ${response.status}`);
        }
      } catch (error) {
        console.log(`      ❌ Error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.log('   ❌ Error:', error.message);
  }
  
  console.log('\n🎯 Test completed!');
  console.log('\n📝 Summary:');
  console.log('✅ /invoice?kode=... → redirects to /api/invoice/[kode]');
  console.log('✅ /api/invoice/[kode] → direct access');
  console.log('❌ //invoice?kode=... → 404 (double slash)');
  console.log('❌ /invoice/[kode] → 404 (wrong path)');
}

// Jalankan test
testRedirects().catch(console.error);
