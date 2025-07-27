import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FitnessPage from './components/FitnessPage';
import TravelPage from './components/TravelPage';
import WeatherPage from './components/WeatherPage';
import AccountingPage from './components/AccountingPage';
import './index.css';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>      
      <Router basename={process.env.REACT_APP_BASENAME}>
        <div className="min-h-screen bg-gray-50">
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 