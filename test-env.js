// Test script untuk environment variables
// Jalankan di browser console

async function testEnvironmentVariables() {
  try {
    console.log('🔍 Testing environment variables...');
    
    // Test API endpoint
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nama: 'Test User',
        email: 'test@example.com',
        pesan: 'Test environment variables'
      })
    });
    
    console.log('Response status:', response.status);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ Success! Parsed JSON:', data);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
      }
    } else {
      console.error('❌ HTTP Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
  }
}

// Test GET request juga
async function testGetRequest() {
  try {
    console.log('📋 Testing GET request...');
    
    const response = await fetch('/api/feedback');
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
console.log('🚀 Starting Environment Variables Tests...');
testEnvironmentVariables().then(() => {
  console.log('📋 Testing GET request...');
  return testGetRequest();
}).then(() => {
  console.log('✅ All tests completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
}); 