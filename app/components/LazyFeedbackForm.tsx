'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Lazy load FeedbackForm component
const FeedbackForm = dynamic(() => import('./FeedbackForm'), {
  loading: () => (
    <div className="bg-gray-100 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
      <div className="text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#213DFF] mx-auto mb-4"></div>
        <p>Loading feedback form...</p>
      </div>
    </div>
  ),
  ssr: false,
});

export default function LazyFeedbackForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    // Intersection Observer untuk lazy loading feedback form
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px', // Start loading 200px before it comes into view
      }
    );

    const feedbackContainer = document.getElementById('feedback-container');
    if (feedbackContainer) {
      observer.observe(feedbackContainer);
    }

    return () => {
      if (feedbackContainer) {
        observer.unobserve(feedbackContainer);
      }
    };
  }, [hasLoaded]);

  return (
    <div id="feedback-container">
      {isVisible ? (
        <FeedbackForm />
      ) : (
        <div className="bg-gray-100 rounded-xl p-6 text-center min-h-[300px] flex items-center justify-center">
          <div className="text-gray-500">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4 w-3/4 mx-auto"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
