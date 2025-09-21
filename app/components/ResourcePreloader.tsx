'use client';

import { useEffect } from 'react';

export default function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources
    const preloadResources = [
      { href: '/images/brandman-transparant.png', as: 'image' },
      { href: '/svg/gemitra-logo.svg', as: 'image' },
      { href: '/svg/gemitra-text.svg', as: 'image' },
    ];

    preloadResources.forEach(({ href, as }) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      document.head.appendChild(link);
    });

    // Prefetch important pages
    const prefetchPages = ['/wisata', '/event'];
    
    prefetchPages.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    // DNS prefetch for external domains
    const dnsPrefetchDomains = [
      'https://script.google.com',
      'https://api.qrserver.com',
      'https://images.unsplash.com',
    ];

    dnsPrefetchDomains.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    });

    // Preconnect to critical domains
    const preconnectDomains = [
      'https://script.google.com',
      'https://fonts.googleapis.com',
    ];

    preconnectDomains.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
    });

  }, []);

  return null;
}
