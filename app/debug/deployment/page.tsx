'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { findCorrectDeploymentUrl, logDeploymentInfo } from '../../utils/urlValidator';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { robustApiService, robustEventsApiService } from '../../services/robustApi';

interface ValidationResult {
  url: string;
  isValid: boolean;
  supportsEndpoints: string[];
  error?: string;
}

export default function DeploymentDebugPage() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [recommendedUrl, setRecommendedUrl] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);

  const runValidation = async () => {
    setIsValidating(true);
    logDeploymentInfo();
    
    try {
      const result = await findCorrectDeploymentUrl();
      setValidationResults(result.validationResults);
      setRecommendedUrl(result.recommendedUrl || '');
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const updateStats = () => {
    try {
      setPerformanceStats(performanceMonitor.getStats());
      setCacheStats(robustApiService.getCacheStats());
    } catch (error) {
      console.warn('Failed to update stats:', error);
      setPerformanceStats(null);
      setCacheStats(null);
    }
  };

  const testEventsEndpoint = async () => {
    try {
      console.log('🧪 Testing events endpoint...');
      const events = await robustEventsApiService.fetchEvents();
      console.log('✅ Events loaded successfully:', events.length, 'events');
      alert(`✅ Events loaded successfully: ${events.length} events`);
    } catch (error) {
      console.error('❌ Events test failed:', error);
      alert(`❌ Events test failed: ${error}`);
    }
  };

  const testDestinationsEndpoint = async () => {
    try {
      console.log('🧪 Testing destinations endpoint...');
      const destinations = await robustApiService.fetchDestinations();
      console.log('✅ Destinations loaded successfully:', destinations.length, 'destinations');
      alert(`✅ Destinations loaded successfully: ${destinations.length} destinations`);
    } catch (error) {
      console.error('❌ Destinations test failed:', error);
      alert(`❌ Destinations test failed: ${error}`);
    }
  };

  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔧 Deployment Debug Dashboard</h1>
        
        {/* Environment Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL
                </label>
                <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                  {process.env.NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL || '❌ NOT SET'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NODE_ENV
                </label>
                <div className="bg-gray-50 p-3 rounded border font-mono text-sm">
                  {process.env.NODE_ENV}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URL Validation */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Google Apps Script URL Validation</h2>
              <Button 
                onClick={runValidation} 
                disabled={isValidating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isValidating ? 'Validating...' : 'Run Validation'}
              </Button>
            </div>
            
            {recommendedUrl && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-800 mb-2">✅ Recommended URL:</h3>
                <code className="text-green-700 text-sm break-all">{recommendedUrl}</code>
              </div>
            )}
            
            <div className="space-y-4">
              {validationResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  result.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-sm break-all flex-1 mr-4">{result.url}</code>
                    <Badge variant={result.isValid ? 'default' : 'destructive'}>
                      {result.isValid ? 'Valid' : 'Invalid'}
                    </Badge>
                  </div>
                  
                  {result.supportsEndpoints.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-600">Supported endpoints: </span>
                      <span className="text-sm text-green-600">
                        {result.supportsEndpoints.join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {result.error && (
                    <div className="text-sm text-red-600">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Testing */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">API Endpoint Testing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={testEventsEndpoint}
                className="bg-purple-600 hover:bg-purple-700"
              >
                🎭 Test Events Endpoint
              </Button>
              <Button 
                onClick={testDestinationsEndpoint}
                className="bg-green-600 hover:bg-green-700"
              >
                🏞️ Test Destinations Endpoint
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Performance Stats</h2>
              {performanceStats ? (
                <div className="space-y-2 text-sm">
                  <div>Total Requests: <strong>{performanceStats.totalRequests}</strong></div>
                  <div>Success Rate: <strong>{performanceStats.successRate}%</strong></div>
                  <div>Average Duration: <strong>{performanceStats.averageDuration}ms</strong></div>
                  <div>Failed Requests: <strong>{performanceStats.failedRequests}</strong></div>
                  <div>Timeout Requests: <strong>{performanceStats.timeoutRequests}</strong></div>
                  <div>Slow Requests (&gt;3s): <strong>{performanceStats.slowRequests}</strong></div>
                </div>
              ) : (
                <p className="text-gray-500">No performance data yet</p>
              )}
              <Button 
                onClick={() => {
                  try {
                    performanceMonitor.logStats();
                    updateStats();
                  } catch (error) {
                    console.warn('Failed to log performance stats:', error);
                    updateStats();
                  }
                }}
                className="mt-4 w-full"
                variant="outline"
              >
                Refresh Stats
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cache Stats</h2>
              {cacheStats ? (
                <div className="space-y-2 text-sm">
                  <div>Cache Size: <strong>{cacheStats.size} entries</strong></div>
                  <div>Memory Usage: <strong>{cacheStats.memoryUsage || 'Unknown'}</strong></div>
                  <div className="mt-3">
                    <details>
                      <summary className="cursor-pointer text-blue-600">Cache Keys</summary>
                      <ul className="mt-2 space-y-1 text-xs">
                        {cacheStats.keys.map((key: string, index: number) => (
                          <li key={index} className="font-mono bg-gray-100 p-1 rounded">
                            {key}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No cache data yet</p>
              )}
              <Button 
                onClick={() => {
                  robustApiService.clearCache();
                  updateStats();
                  alert('Cache cleared!');
                }}
                className="mt-4 w-full"
                variant="outline"
              >
                Clear Cache
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Console Helpers */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Console Helpers</h2>
            <p className="text-gray-600 mb-4">
              Open browser console and use these commands for debugging:
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-1">
              <div>{`// Check performance stats`}</div>
              <div className="text-yellow-300">performanceMonitor.logStats()</div>
              <div>{`// Clear performance metrics`}</div>
              <div className="text-yellow-300">performanceMonitor.clearMetrics()</div>
              <div>{`// Check cache stats`}</div>
              <div className="text-yellow-300">robustApiService.getCacheStats()</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
