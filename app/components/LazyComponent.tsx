'use client';

import { useState, useEffect, ReactNode } from 'react';

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export default function LazyComponent({ 
  children, 
  fallback = <div className="animate-pulse bg-gray-200 rounded h-32"></div>,
  threshold = 0.1,
  rootMargin = '50px',
  delay = 0
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
              setShouldRender(true);
            }, delay);
          } else {
            setIsVisible(true);
            setShouldRender(true);
          }
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const element = document.getElementById('lazy-component');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, delay]);

  return (
    <div id="lazy-component">
      {shouldRender ? children : fallback}
    </div>
  );
}
