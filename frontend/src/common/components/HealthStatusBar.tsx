import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Monitor, Server, Database, Wrench, Globe, Hand, GitBranch } from 'lucide-react';
import { healthApi } from '../../config/api';

// Get API URL from environment variable, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface HealthStatus {
  status: string;
  backend: {
    address: string;
    environment: string;
  };
  database: {
    status: string;
    available: boolean;
    error: string | null;
    host: string;
    port: number;
    database: string;
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
          <div className="group relative">
            <Monitor className="w-3 h-3" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Frontend Application
            </span>
          </div>
          
          <div className="group relative">
            <EnvironmentIcon className="w-3 h-3" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Environment: {getFrontendEnvironment() === 'dev' ? 'Development' : 'Production'}
            </span>
          </div>
          
          <div className="group relative">
            <DeploymentMethodIcon className="w-3 h-3" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Deployment: {getDeploymentMethod() === 'git' ? 'GitHub Actions' : 'Manual'}
            </span>
          </div>
          
          <span>|</span>
          
          {/* Backend */}
          <div className="group relative">
            <Server className="w-3 h-3" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Backend: {API_URL}
            </span>
          </div>
          
          <div className="group relative">
            {isHealthy ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Backend Status: {isHealthy ? 'Healthy' : 'Unhealthy'}
            </span>
          </div>
          
          <span>|</span>
          
          {/* Database */}
          <div className="group relative">
            <Database className="w-3 h-3" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Database: {healthStatus.database.host}:{healthStatus.database.port}
            </span>
          </div>
          
          <div className="group relative">
            {healthStatus.database.available ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Database Status: {healthStatus.database.available ? 'Connected' : 'Disconnected'}
              {healthStatus.database.error && (
                <>
                  <br />
                  Error: {healthStatus.database.error}
                </>
              )}
            </span>
          </div>
        </span>
      </div>
    </div>
  );
};

export default HealthStatusBar; 