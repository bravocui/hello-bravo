import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './common/components/Login';
import Dashboard from './features/dashboard/Dashboard';
import FitnessPage from './features/fitness/FitnessPage';
import TravelPage from './features/travel/TravelPage';
import WeatherPage from './features/weather/WeatherPage';
import LedgerPage from './features/ledger/LedgerPage';
import AdminPortal from './features/admin/AdminPortal';
import HealthStatusBar from './common/components/HealthStatusBar';
import { Chatbot, ChatButton } from './common/components';

import './index.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Guest Route component - blocks guest users
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is guest
  const isGuest = user?.email?.includes('guest') || user?.name?.includes('Guest') || user?.role === 'GUEST';
  if (isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎭</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Feature Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            This feature is not available for guest users. Please contact an administrator to get full access.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>      
      <Router basename={process.env.REACT_APP_BASENAME}>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleChatToggle = () => {
    setIsChatbotOpen(true);
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fitness" 
          element={
            <ProtectedRoute>
              <FitnessPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/travel" 
          element={
            <ProtectedRoute>
              <TravelPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/weather" 
          element={
            <ProtectedRoute>
              <WeatherPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ledger" 
          element={
            <GuestRoute>
              <LedgerPage />
            </GuestRoute>
          } 
        />
        <Route 
          path="/admin-portal" 
          element={
            <AdminRoute>
              <AdminPortal />
            </AdminRoute>
          } 
        />

      </Routes>
      <HealthStatusBar />
      
      {/* Main Chat Button */}
      <ChatButton onClick={handleChatToggle} />
      
      {/* Classic Chatbot */}
      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
    </>
  );
};

export default App;
