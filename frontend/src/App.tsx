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
// import AssistantBot from './common/components/AssistantBot';
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
  const [isAssistantBotOpen, setIsAssistantBotOpen] = useState(false);
  const [chatMode, setChatMode] = useState<'classic' | 'assistant'>('classic');

  const handleChatToggle = () => {
    if (chatMode === 'classic') {
      setIsChatbotOpen(true);
    } else {
      setIsAssistantBotOpen(true);
    }
  };

  const handleModeSwitch = () => {
    setChatMode(chatMode === 'classic' ? 'assistant' : 'classic');
    setIsChatbotOpen(false);
    setIsAssistantBotOpen(false);
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
      
      {/* Chat Mode Toggle Button */}
      <button
        onClick={handleModeSwitch}
        className="fixed bottom-6 left-6 w-16 h-16 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-200 hover:scale-110 flex items-center justify-center z-40"
        title={`Switch to ${chatMode === 'classic' ? 'Assistant UI' : 'Classic'} Chat`}
      >
        <span className="text-xs font-bold">
          {chatMode === 'classic' ? 'AU' : 'CC'}
        </span>
      </button>

      {/* Main Chat Button */}
      <ChatButton onClick={handleChatToggle} />
      
      {/* Classic Chatbot */}
      <Chatbot 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />
      
      {/* Assistant UI Chatbot */}
      {isAssistantBotOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">AU</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Assistant UI Chat</h3>
                <p className="text-xs text-gray-500">Powered by assistant-ui</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAssistantBotOpen(false)} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AssistantBot />
          </div>
        </div>
      )}
    </>
  );
};

export default App; 