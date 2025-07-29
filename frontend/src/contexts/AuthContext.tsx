import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../config/api';

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

  // Function to check database status
  const checkDatabaseStatus = async () => {
    try {
      const healthResponse = await api.get('/health');
      const isAvailable = healthResponse.data.database?.available ?? false;
      setDatabaseAvailable(isAvailable);
      console.log('🔍 Database status updated:', isAvailable);
    } catch (error) {
      console.warn('Could not check database status:', error);
      setDatabaseAvailable(false);
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
      const { user: userData } = response.data;
      setUser(userData);
    } catch (error) {
      setUser(null);
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
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    databaseAvailable,
    refreshDatabaseStatus: checkDatabaseStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 