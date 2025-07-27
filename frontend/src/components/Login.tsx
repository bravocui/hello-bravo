import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Cloud, DollarSign } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = useCallback(async (response: any) => {
    try {
      await login(response.credential);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  }, [login, navigate]);

  const handleDemoLogin = useCallback(async () => {
    try {
      // Create a fake demo token
      const demoToken = 'demo-token-' + Date.now();
      await login(demoToken);
      navigate('/');
    } catch (error) {
      console.error('Demo login failed:', error);
      alert('Demo login failed. Please try again.');
    }
  }, [login, navigate]);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID!, // Use env variable
        callback: handleGoogleLogin,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-login-button'),
        {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        }
      );
    }
  }, [handleGoogleLogin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Life Tracker
          </h1>
          <p className="text-gray-600 text-lg">
            Track your fitness, travels, and weather
          </p>
        </div>

        {/* Feature Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-fitness-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-fitness-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Fitness</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-travel-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-travel-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Travel</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-weather-100 rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-weather-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Weather</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-accounting-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-accounting-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Accounting</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to continue tracking your life
            </p>
          </div>

          {/* Google Login Button */}
          <div className="space-y-4">
            <div id="google-login-button" className="w-full"></div>
            
            {/* Demo Login Button (for development) */}
            <button
              onClick={() => handleDemoLogin()}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <span>Demo Login (Development)</span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our terms of service and privacy policy
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>Built with React & FastAPI</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 