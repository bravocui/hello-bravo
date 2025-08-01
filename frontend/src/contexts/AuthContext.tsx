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
  login: (token: string, stayLoggedIn?: boolean) => Promise<void>;
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

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

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

  // Function to save token to localStorage
  const saveTokenToStorage = (token: string, userData: User) => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('💾 Token saved to localStorage');
    } catch (error) {
      console.warn('Failed to save token to localStorage:', error);
    }
  };

  // Function to load token from localStorage
  const loadTokenFromStorage = (): { token: string | null; userData: User | null } => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const userDataStr = localStorage.getItem(USER_DATA_KEY);
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      
      if (token && userData) {
        console.log('💾 Token loaded from localStorage');
        return { token, userData };
      }
    } catch (error) {
      console.warn('Failed to load token from localStorage:', error);
    }
    return { token: null, userData: null };
  };

  // Function to clear token from localStorage
  const clearTokenFromStorage = () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      console.log('🗑️ Token cleared from localStorage');
    } catch (error) {
      console.warn('Failed to clear token from localStorage:', error);
    }
  };

  // Function to check cookie status
  const checkCookieStatus = () => {
    try {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => 
        cookie.trim().startsWith('session_token=')
      );
      
      if (sessionCookie) {
        console.log('🍪 Session cookie found:', sessionCookie.substring(0, 50) + '...');
      } else {
        console.log('🍪 No session cookie found');
      }
    } catch (error) {
      console.warn('Failed to check cookie status:', error);
    }
  };

  useEffect(() => {
    // Only check auth once on mount
    if (hasCheckedAuth) return;
    
    const checkAuth = async () => {
      try {
        // First check database status
        await checkDatabaseStatus();
        
        // Check cookie status for debugging
        checkCookieStatus();
        
        // Always verify with the server first (this will use cookies)
        const response = await api.get('/user/profile');
        const serverUser = response.data;
        
        // Update with fresh user data from server
        setUser(serverUser);
        
        // Also try to load token from localStorage as backup
        const { token: storedToken, userData: storedUser } = loadTokenFromStorage();
        
        if (storedToken && storedUser) {
          // Set the token in the header for API calls
          setAuthToken(storedToken);
          setAuthHeader(storedToken);
          console.log('🔑 Using localStorage token as backup for API calls');
        }
        
        console.log('✅ Authentication verified with server');
        
      } catch (error) {
        console.log('❌ Authentication check failed, clearing stored data');
        setUser(null);
        setAuthToken(null);
        setAuthHeader(null);
        clearTokenFromStorage();
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

  const login = async (token: string, stayLoggedIn: boolean = false) => {
    try {
      const response = await api.post('/auth/google', { token, stay_logged_in: stayLoggedIn });
      const { user: userData, token: authToken } = response.data;
      
      // Save to state
      setUser(userData);
      setAuthToken(authToken);
      setAuthHeader(authToken);
      
      // Also save to localStorage as backup
      saveTokenToStorage(authToken, userData);
      
      console.log('🔑 Login successful, cookie and localStorage token stored');
      console.log(`🍪 Cookie will expire in ${stayLoggedIn ? '7 days' : '1 hour'}`);
      
      // Check cookie status after login
      setTimeout(() => {
        checkCookieStatus();
      }, 1000);
    } catch (error) {
      setUser(null);
      setAuthToken(null);
      setAuthHeader(null);
      clearTokenFromStorage();
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
    clearTokenFromStorage();
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