import React, { useEffect, useCallback, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Cloud, User } from 'lucide-react';
import { getVersionString } from '../config/version';

declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = useCallback(async (response: any) => {
    try {
      console.log('Google login response received:', response);
      await login(response.credential, stayLoggedIn);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      // Check if it's a new user error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      if (errorMessage.includes('Login as guest') || errorMessage.includes('contact admin')) {
        alert('Login as guest. Please contact admin to add you as user.');
      } else {
        alert(`Login failed: ${errorMessage}`);
      }
    }
  }, [login, navigate, stayLoggedIn]);

  const handleGuestLogin = useCallback(async () => {
    try {
      // Create a guest token
      const guestToken = 'guest-token-' + Date.now();
      await login(guestToken, stayLoggedIn);
      navigate('/');
    } catch (error) {
      console.error('Guest login failed:', error);
      alert('Guest login failed. Please try again.');
    }
  }, [login, navigate, stayLoggedIn]);

  useEffect(() => {
    if (window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID!, // Use env variable
          callback: handleGoogleLogin,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-login-button'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            type: 'standard',
          }
        );
        
        console.log('Google OAuth initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Google OAuth:', error);
      }
    } else {
      console.log('Google OAuth not loaded yet');
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
          <p className="text-xs text-gray-500 mt-1">{getVersionString()}</p>
        </div>

        {/* Feature Preview */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
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

          {/* Login Buttons */}
          <div className="space-y-4">
            <div id="google-login-button" className="w-full"></div>
            
            {/* Guest Login Button */}
            <button
              onClick={() => handleGuestLogin()}
              className="w-full bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <User className="w-4 h-4" />
              <span>Login as Guest</span>
            </button>
          </div>

          {/* Stay Logged In Checkbox */}
          <div className="mt-4 flex items-center">
            <input
              id="stay-logged-in"
              type="checkbox"
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="stay-logged-in" className="ml-2 text-sm text-gray-700">
              Stay logged in for 1 week
            </label>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Guest users have limited access. Contact admin for full access.
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