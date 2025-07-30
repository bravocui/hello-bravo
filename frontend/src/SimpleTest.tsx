import React, { useState, useEffect } from 'react';
import { healthApi } from './config/api';

const SimpleTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Testing health check...');
        console.log('🔍 API URL:', healthApi.defaults.baseURL);
        
        const response = await healthApi.get('/health');
        console.log('✅ Health check successful:', response.data);
        setHealthStatus(response.data);
      } catch (err: any) {
        console.error('❌ Health check failed:', err);
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
          console.error('Response headers:', err.response.headers);
        }
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testHealth();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Health Check Test</h1>
      
      {loading && (
        <div className="text-blue-600">Loading...</div>
      )}
      
      {error && (
        <div className="text-red-600">
          <h2 className="font-bold">Error:</h2>
          <pre>{error}</pre>
        </div>
      )}
      
      {healthStatus && (
        <div className="text-green-600">
          <h2 className="font-bold">Success:</h2>
          <pre>{JSON.stringify(healthStatus, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-4">
        <h2 className="font-bold">API Configuration:</h2>
        <p>Base URL: {healthApi.defaults.baseURL}</p>
        <p>Timeout: {healthApi.defaults.timeout}ms</p>
        <p>With Credentials: {healthApi.defaults.withCredentials ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default SimpleTest; 