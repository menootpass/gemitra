"use client";
import { useEffect } from "react";

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalImages = () => {
      const criticalImages = [
        '/images/brio.jpg',
        '/images/mobilio.png',
        '/images/innova.png'
      ];

      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      });
    };

    // Preconnect to external domains
    const preconnectExternalDomains = () => {
      const domains = [
        'https://images.unsplash.com',
        'https://drive.google.com',
        'https://lh3.googleusercontent.com'
      ];

      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
      });
    };

    // Add resource hints
    const addResourceHints = () => {
      // DNS prefetch for external domains
      const dnsPrefetchDomains = [
        'images.unsplash.com',
        'drive.google.com',
        'lh3.googleusercontent.com'
      ];

      dnsPrefetchDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      });
    };

    // Run optimizations
    preloadCriticalImages();
    preconnectExternalDomains();
    addResourceHints();

    // Cleanup function
    return () => {
      // Remove any dynamically added links if needed
      const dynamicLinks = document.querySelectorAll('link[rel="preload"], link[rel="preconnect"], link[rel="dns-prefetch"]');
      dynamicLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
}
