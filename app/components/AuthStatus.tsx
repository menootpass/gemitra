"use client";

import { useState, useEffect } from 'react';

interface AuthStatusProps {
  className?: string;
}

export default function AuthStatus({ className = "" }: AuthStatusProps) {
  const [authStatus, setAuthStatus] = useState<{
    hasUsername: boolean;
    hasPassword: boolean;
    isConfigured: boolean;
  }>({
    hasUsername: false,
    hasPassword: false,
    isConfigured: false,
  });

  useEffect(() => {
    const username = process.env.NEXT_PUBLIC_SHEETDB_USERNAME;
    const password = process.env.NEXT_PUBLIC_SHEETDB_PASSWORD;
    
    setAuthStatus({
      hasUsername: !!username,
      hasPassword: !!password,
      isConfigured: !!(username && password),
    });
  }, []);

  if (authStatus.isConfigured) {
    return (
      <div className={`bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-green-600">✓</span>
          <span className="text-sm font-medium">Auth configured</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg ${className}`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-yellow-600">⚠</span>
          <span className="text-sm font-medium">Auth not configured</span>
        </div>
        <div className="text-xs">
          <p>Create <code className="bg-yellow-200 px-1 rounded">.env.local</code> with:</p>
          <pre className="bg-yellow-200 p-2 rounded mt-1 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SHEETDB_USERNAME=your_username
NEXT_PUBLIC_SHEETDB_PASSWORD=your_password`}
          </pre>
        </div>
      </div>
    </div>
  );
} 