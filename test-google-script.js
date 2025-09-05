// Test Google Apps Script connection
const testGoogleScript = async () => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec';
  
  try {
    console.log('🧪 Testing Google Apps Script connection...');
    console.log('URL:', SCRIPT_URL);
    
    // Test with a simple get-transaction request
    const testKode = 'INV-1756589376528';
    const url = `${SCRIPT_URL}?action=get-transaction&kode=${testKode}`;
    
    console.log('Testing URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing Google Script:', error);
  }
};

testGoogleScript();
