import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { healthApi } from '../config/api';

interface User {
  email: string;
  name: string;
  picture?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  databaseAvailable: boolean;
  refreshDatabaseStatus: () => Promise<void>;
  authToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [databaseAvailable, setDatabaseAvailable] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Function to check database status
  const checkDatabaseStatus = async () => {
    try {
      console.log('🔍 Checking database status at:', healthApi.defaults.baseURL);
      const healthResponse = await healthApi.get('/health');
      const isAvailable = healthResponse.data.database?.available ?? false;
      setDatabaseAvailable(isAvailable);
      console.log('🔍 Database status updated:', isAvailable);
    } catch (error: any) {
      console.warn('Could not check database status:', error);
      if (error.response) {
        console.warn('Response status:', error.response.status);
        console.warn('Response data:', error.response.data);
      }
      setDatabaseAvailable(false);
    }
  };

  // Function to set Authorization header
  const setAuthHeader = (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Authorization header set');
    } else {
      delete api.defaults.headers.common['Authorization'];
      console.log('🔑 Authorization header removed');
    }
  };

  useEffect(() => {
    // Only check auth once on mount
    if (hasCheckedAuth) return;
    
    const checkAuth = async () => {
      try {
        // First check database status
        await checkDatabaseStatus();
        
        // Then check user auth
        const response = await api.get('/user/profile');
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
        setHasCheckedAuth(true);
      }
    };
    
    checkAuth();
  }, [hasCheckedAuth]);

  // Periodically check database status
  useEffect(() => {
    const interval = setInterval(checkDatabaseStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const login = async (token: string) => {
    try {
      const response = await api.post('/auth/google', { token });
      const { user: userData, token: authToken } = response.data;
      setUser(userData);
      setAuthToken(authToken);
      setAuthHeader(authToken);
      console.log('🔑 Login successful, token stored');
    } catch (error) {
      setUser(null);
      setAuthToken(null);
      setAuthHeader(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      // Ignore errors on logout
    }
    setUser(null);
    setAuthToken(null);
    setAuthHeader(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    databaseAvailable,
    refreshDatabaseStatus: checkDatabaseStatus,
    authToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 