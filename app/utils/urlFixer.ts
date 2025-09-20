// URL Fixer untuk memastikan hanya URL yang benar yang digunakan

// URL yang BENAR (dari .env.local)
const CORRECT_URL = 'https://script.google.com/macros/s/AKfycbxAPEjrQAN0WB_cId8CO_S-u-icqRnmJqIEiUeIeAvcCveVdmCXg_DPe-5Zw6F9k64lGw/exec';

// URL yang BERMASALAH (harus dihindari)
const PROBLEMATIC_URL = 'https://script.google.com/macros/s/AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw/exec';

export function getCorrectGoogleAppsScriptUrl(): string {
  // ALWAYS return the correct URL, ignore environment variable for now
  return CORRECT_URL;
}

export function validateAndFixUrl(url: string): string {
  // If URL contains the problematic script ID, replace with correct one
  if (url.includes('AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw')) {
    console.warn('🚨 Detected problematic URL, replacing with correct one');
    return url.replace(
      'AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw',
      'AKfycbxAPEjrQAN0WB_cId8CO_S-u-icqRnmJqIEiUeIeAvcCveVdmCXg_DPe-5Zw6F9k64lGw'
    );
  }
  
  return url;
}

export function clearProblematicUrlFromCache(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear from localStorage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value && value.includes('AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw')) {
          console.warn('🗑️ Removing problematic URL from localStorage:', key);
          localStorage.removeItem(key);
        }
      }
    }

    // Clear from sessionStorage
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value && value.includes('AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw')) {
          console.warn('🗑️ Removing problematic URL from sessionStorage:', key);
          sessionStorage.removeItem(key);
        }
      }
    }

    console.log('✅ Cache cleanup completed');
  } catch (error) {
    console.error('❌ Error during cache cleanup:', error);
  }
}

// Override fetch function to intercept and fix problematic URLs
export function createSafeFetch() {
  const originalFetch = window.fetch;
  
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    let url = typeof input === 'string' ? input : input.toString();
    
    // Fix problematic URL if detected
    url = validateAndFixUrl(url);
    
    console.log('🔍 Safe fetch to:', url);
    
    return originalFetch(url, init);
  };
}

// Initialize URL fixer
export function initUrlFixer(): void {
  if (typeof window === 'undefined') return;
  
  console.log('🔧 Initializing URL fixer...');
  
  // Clear problematic URLs from cache
  clearProblematicUrlFromCache();
  
  // Override fetch if in development
  if (process.env.NODE_ENV === 'development') {
    // Monkey patch fetch untuk debug
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let url = typeof input === 'string' ? input : input.toString();
      
      // Log all Google Apps Script requests
      if (url.includes('script.google.com')) {
        console.log('🔍 Intercepted Google Apps Script request:', url);
        
        // Fix problematic URL
        const fixedUrl = validateAndFixUrl(url);
        if (fixedUrl !== url) {
          console.log('🔄 Fixed URL to:', fixedUrl);
          url = fixedUrl;
        }
      }
      
      return originalFetch(url, init);
    };
  }
  
  console.log('✅ URL fixer initialized');
}
