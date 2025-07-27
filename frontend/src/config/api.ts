import axios from 'axios';

// Get API URL from environment variable, fallback to localhost for development
const API_URL = process.env.REACT_APP_API_URL || 'https://hello-bravo-api-772654378329.us-central1.run.app';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable sending cookies with requests
  withCredentials: true,
});

// No request interceptor needed - cookies are sent automatically with withCredentials: true

// Response interceptor for error handling (no redirects)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Just log the error, don't redirect
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api; 