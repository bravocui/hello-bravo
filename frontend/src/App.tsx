import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FitnessPage from './components/FitnessPage';
import TravelPage from './components/TravelPage';
import WeatherPage from './components/WeatherPage';
import AccountingPage from './components/AccountingPage';
import UserManagementPage from './components/UserManagementPage';
import DatabaseBanner from './components/DatabaseBanner';
import HealthStatusBar from './components/HealthStatusBar';
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
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
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
  const { databaseAvailable } = useAuth();
  
  return (
    <>
      <DatabaseBanner databaseAvailable={databaseAvailable} />
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
          path="/accounting" 
          element={
            <ProtectedRoute>
              <AccountingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user-management" 
          element={
            <AdminRoute>
              <UserManagementPage />
            </AdminRoute>
          } 
        />
      </Routes>
      <HealthStatusBar />
    </>
  );
};

export default App; 