import { createContext, useContext, useState, useEffect } from 'react';
import { login, getProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext: Checking token:', token ? 'Token exists' : 'No token');
    
    if (token) {
      getProfile()
        .then(response => {
          console.log('AuthContext: Profile loaded successfully:', response.data);
          setUser(response.data);
        })
        .catch((error) => {
          console.error('AuthContext: Profile load failed:', error);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('AuthContext: No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const loginUser = async (credentials) => {
    try {
      console.log('AuthContext: Attempting login with:', credentials);
      const response = await login(credentials);
      const { token, user: userData } = response.data;
      console.log('AuthContext: Login successful, setting token and user');
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out, clearing token and user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loginUser,
    logout,
    loading
  };

  console.log('AuthContext: Current state:', { user: !!user, isAuthenticated: !!user, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
