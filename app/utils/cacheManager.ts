// Cache Manager untuk membersihkan cache yang mungkin menyimpan URL lama

export function clearAllCaches(): void {
  try {
    // Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('gemitra') || 
          key.includes('swr') || 
          key.includes('api') ||
          key.includes('cache')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }

    // Clear sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.clear();
    }

    // Clear any service worker caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error clearing caches:', error);
  }
}

export function clearApiCaches(): void {
  try {
    // Clear API service caches
    import('../services/robustApi').then(({ robustApiService, robustEventsApiService }) => {
      robustApiService.clearCache();
    });

    import('../services/api').then(({ apiService }) => {
      apiService.clearCache();
    });

  } catch (error) {
    console.error('❌ Error clearing API caches:', error);
  }
}

export function forceRefreshPage(): void {
  if (typeof window !== 'undefined') {
    // Clear all caches first
    clearAllCaches();
    
    // Force hard refresh
    window.location.reload();
  }
}

// Debug helper untuk melihat semua cache yang tersimpan
export function debugCacheContents(): void {
  console.group('🔍 Cache Debug Info');
  
  // Check localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        // localStorage contents logging removed for production optimization
      }
    }
  }

  // Check if there are any cached URLs
  const urlPattern = /script\.google\.com.*AKfyc[a-zA-Z0-9_-]+/g;
  
  if (typeof window !== 'undefined' && window.localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value) {
          const matches = value.match(urlPattern);
          if (matches) {
            console.warn('🚨 Found cached URLs in localStorage:', key, matches);
          }
        }
      }
    }
  }

  console.groupEnd();
}

// Auto-clear suspicious cache entries on app start
export function initCacheCleanup(): void {
  if (typeof window !== 'undefined') {
    // Check for suspicious URLs in cache
    const suspiciousUrl = 'AKfycbyeOtHXiBiEiDQwM9FF9qA93z9KOYr4jQKqmYm1JpOhKLW5nlwMoNB6zzCjM93S_IZpDw';
    
    // Check localStorage for the problematic URL
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value && value.includes(suspiciousUrl)) {
          console.warn('🚨 Found problematic URL in cache, removing:', key);
          localStorage.removeItem(key);
        }
      }
    }
  }
}
