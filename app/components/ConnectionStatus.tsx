'use client';

import { useState, useEffect } from 'react';
import { connectionMonitor } from '../services/robustApi';
import { Wifi, WifiOff } from 'lucide-react';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Set initial status
    setIsOnline(connectionMonitor.getStatus());

    const unsubscribe = connectionMonitor.onStatusChange((online) => {
      setIsOnline(online);
      
      // Show notification when status changes
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    });

    return unsubscribe;
  }, []);

  // Don't render anything if online and no notification needed
  if (isOnline && !showNotification) {
    return null;
  }

  return (
    <>
      {/* Persistent offline indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 px-4 z-50">
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={16} />
            <span className="text-sm font-medium">
              No internet connection - Some features may not work
            </span>
          </div>
        </div>
      )}

      {/* Status change notification */}
      {showNotification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          isOnline 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-sm font-medium">
              {isOnline ? 'Connection restored' : 'Connection lost'}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

