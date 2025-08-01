import axios from 'axios';

// Get API URL from environment variable, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout to 30 seconds for operations that update many records
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with requests for auth endpoints only
  withCredentials: true,
});

// Create a separate axios instance for health checks (no credentials needed)
const healthApi = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Shorter timeout for health checks
  headers: {
    'Content-Type': 'application/json',
  },
  // Try with credentials for health checks (some servers require it)
  withCredentials: true,
});

// Request interceptor to log requests
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.headers.Authorization) {
      console.log('🔑 Authorization header present');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    console.error('🔍 Request URL:', error.config?.url);
    console.error('🔍 Request Method:', error.config?.method);
    return Promise.reject(error);
  }
);

export default api;
export { healthApi }; 