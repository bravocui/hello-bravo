import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Monitor, Server, Database, Wrench, Globe, Hand, GitBranch } from 'lucide-react';
import { healthApi } from '../../config/api';

interface HealthStatus {
  status: string;
  database: {
    status: string;
    available: boolean;
    error: string | null;
  };
  timestamp: string;
  environment?: string; // Backend environment
}

const HealthStatusBar: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get frontend environment
  const getFrontendEnvironment = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'dev';
    }
    return 'prod';
  };

  // Get environment icon
  const getEnvironmentIcon = () => {
    const env = getFrontendEnvironment();
    return env === 'dev' ? Wrench : Globe;
  };

  // Get deployment method
  const getDeploymentMethod = () => {
    const deploymentMethod = process.env.REACT_APP_DEPLOYMENT_METHOD || 'manual';
    return deploymentMethod === 'github-actions' ? 'git' : 'manual';
  };

  // Get deployment method icon
  const getDeploymentMethodIcon = () => {
    const method = getDeploymentMethod();
    return method === 'git' ? GitBranch : Hand;
  };

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Checking health at:', healthApi.defaults.baseURL);
        const response = await healthApi.get('/health');
        console.log('🔍 Health check response:', response.data);
        setHealthStatus(response.data);
      } catch (err: any) {
        console.error('Health check failed:', err);
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
        }
        setError('Failed to check backend health');
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
  const EnvironmentIcon = getEnvironmentIcon();
  const DeploymentMethodIcon = getDeploymentMethodIcon();

  return (
    <div className={`fixed bottom-0 left-0 right-0 border-t px-4 py-2 text-xs ${
      isHealthy 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : 'bg-red-50 border-red-200 text-red-600'
    }`}>
      <div className="flex items-center justify-center space-x-2">
        <span className="flex items-center space-x-1">
          {/* Frontend */}
          <Monitor className="w-3 h-3" />
          <EnvironmentIcon className="w-3 h-3" />
          <DeploymentMethodIcon className="w-3 h-3" />
          
          <span>|</span>
          
          {/* Backend */}
          <Server className="w-3 h-3" />
          {isHealthy ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          
          <span>|</span>
          
          {/* Database */}
          <Database className="w-3 h-3" />
          {healthStatus.database.available ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
        </span>
      </div>
    </div>
  );
};

export default HealthStatusBar; 