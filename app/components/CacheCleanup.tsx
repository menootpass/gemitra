'use client';

import { useEffect } from 'react';
import { initCacheCleanup } from '../utils/cacheManager';
import { initUrlFixer } from '../utils/urlFixer';

export default function CacheCleanup() {
  useEffect(() => {
    // Run cache cleanup on app initialization
    initCacheCleanup();
    
    // Initialize URL fixer to prevent problematic URLs
    initUrlFixer();
  }, []);

  // This component doesn't render anything
  return null;
}
