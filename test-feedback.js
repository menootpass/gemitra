// Test script untuk Google Apps Script Feedback
// Jalankan di browser console

const TEST_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; // Ganti dengan URL deployment Anda

async function testFeedbackScript() {
  const testData = {
    nama: 'Test User',
    email: 'test@example.com',
    telepon: '081234567890',
    kategori: 'umum',
    rating: 5,
    pesan: 'Ini adalah test feedback dari script',
  };

  try {
    console.log('🚀 Testing Google Apps Script...');
    console.log('URL:', TEST_SCRIPT_URL);
    console.log('Data:', testData);

    const response = await fetch(TEST_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response Text:', responseText);

    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Success! Parsed JSON:', data);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.log('Raw response:', responseText);
      }
    } else {
      console.error('❌ HTTP Error:', response.status, response.statusText);
      console.log('Error response:', responseText);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// Test GET request juga
async function testGetRequest() {
  try {
    console.log('📋 Testing GET request...');
    
    const response = await fetch(TEST_SCRIPT_URL);
    console.log('GET Response Status:', response.status);
    
    const responseText = await response.text();
    console.log('GET Response Text:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ GET Success! Parsed JSON:', data);
      } catch (parseError) {
        console.error('❌ GET JSON Parse Error:', parseError);
      }
    }
  } catch (error) {
    console.error('❌ GET Network Error:', error);
  }
}

// Jalankan tests
console.log('🚀 Starting Feedback Script Tests...');
testFeedbackScript().then(() => {
  console.log('📋 Testing GET request...');
  return testGetRequest();
}).then(() => {
  console.log('✅ All tests completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
}); 