// URL Validator untuk memastikan Google Apps Script deployment yang benar

export async function validateGoogleAppsScriptUrl(url: string): Promise<{
  isValid: boolean;
  supportsEndpoints: string[];
  error?: string;
}> {
  const endpoints = ['destinations', 'events', 'feedback', 'transactions'];
  const results: { [key: string]: boolean } = {};
  
  try {
    // Test each endpoint
    for (const endpoint of endpoints) {
      try {
        const testUrl = `${url}?endpoint=${endpoint}`;
        const response = await fetch(testUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          results[endpoint] = data.success === true;
        } else {
          results[endpoint] = false;
        }
      } catch {
        results[endpoint] = false;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const supportedEndpoints = Object.entries(results)
      .filter(([_, supported]) => supported)
      .map(([endpoint, _]) => endpoint);
    
    return {
      isValid: supportedEndpoints.length > 0,
      supportsEndpoints: supportedEndpoints
    };
    
  } catch (error) {
    return {
      isValid: false,
      supportsEndpoints: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function findCorrectDeploymentUrl(): Promise<{
  recommendedUrl?: string;
  validationResults: Array<{
    url: string;
    isValid: boolean;
    supportsEndpoints: string[];
    error?: string;
  }>;
}> {
  // URLs yang mungkin digunakan
  const candidateUrls = [
    // URL dari environment variable
    process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL,
    // URL fallback dari kode
    'https://script.google.com/macros/s/AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ/exec',
    // URL bermasalah dihapus karena menyebabkan network errors
    // 'https://script.google.com/macros/s/AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw/exec'
  ].filter(Boolean) as string[];
  
  const results = [];
  let bestUrl: string | undefined;
  let maxEndpoints = 0;
  
  for (const url of candidateUrls) {
    console.log(`🔍 Testing deployment URL: ${url}`);
    const validation = await validateGoogleAppsScriptUrl(url);
    
    results.push({
      url,
      ...validation
    });
    
    // Track the URL with most supported endpoints
    if (validation.supportsEndpoints.length > maxEndpoints) {
      maxEndpoints = validation.supportsEndpoints.length;
      bestUrl = url;
    }
    
    console.log(`📊 URL: ${url}`);
    console.log(`   Valid: ${validation.isValid}`);
    console.log(`   Supports: ${validation.supportsEndpoints.join(', ')}`);
    if (validation.error) {
      console.log(`   Error: ${validation.error}`);
    }
  }
  
  return {
    recommendedUrl: bestUrl,
    validationResults: results
  };
}

// Helper untuk debugging deployment issues
export function logDeploymentInfo(): void {
  console.group('🔧 Google Apps Script Deployment Info');
  console.log('Environment URL:', process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL);
  console.log('Fallback URL:', 'AKfycbxCT82LhQVB0sCVt-XH2dhBsbd-bQ2b8nW4oWIL5tlEgMydSGna8BOAOPS0_LY-5hzApQ');
  console.log('Error URL removed:', 'AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw');
  console.groupEnd();
}
