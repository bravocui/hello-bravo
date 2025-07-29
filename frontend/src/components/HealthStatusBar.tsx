import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import api from '../config/api';

interface HealthStatus {
  status: string;
  database: {
    status: string;
    available: boolean;
    error: string | null;
  };
  timestamp: string;
}

const HealthStatusBar: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/health');
        console.log('🔍 Health check response:', response.data);
        setHealthStatus(response.data);
      } catch (err) {
        setError('Failed to check backend health');
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    // Check health immediately
    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
          <span>Checking backend status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 px-4 py-2 text-xs">
        <div className="flex items-center justify-center space-x-2 text-red-600">
          <AlertCircle className="w-3 h-3" />
          <span>Backend connection failed</span>
        </div>
      </div>
    );
  }

  if (!healthStatus) {
    return null;
  }

  const isHealthy = healthStatus.status === 'healthy' && healthStatus.database.available;

  return (
    <div className={`fixed bottom-0 left-0 right-0 border-t px-4 py-2 text-xs ${
      isHealthy 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : 'bg-red-50 border-red-200 text-red-600'
    }`}>
      <div className="flex items-center justify-center space-x-2">
        {isHealthy ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <AlertCircle className="w-3 h-3" />
        )}
        <span>
          Backend: {healthStatus.status} | 
          Database: {healthStatus.database.available ? 'Connected' : 'Disconnected'} | 
          v{healthStatus.timestamp}
        </span>
      </div>
    </div>
  );
};

export default HealthStatusBar; 