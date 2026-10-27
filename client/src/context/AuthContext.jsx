import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cc_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore and verify session with backend on initial mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('cc_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('cc_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, clearing stale auth token.');
          localStorage.removeItem('cc_token');
          localStorage.removeItem('cc_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('cc_token', authToken);
      localStorage.setItem('cc_user', JSON.stringify(loggedInUser));
      return loggedInUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success && res.data) {
      const { user: registeredUser, token: authToken } = res.data;
      setUser(registeredUser);
      setToken(authToken);
      localStorage.setItem('cc_token', authToken);
      localStorage.setItem('cc_user', JSON.stringify(registeredUser));
      return registeredUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cc_user', JSON.stringify(updatedUser));
  };

  // Helper flags
  const isStudent = user?.role === 'student';
  const isOrganizer = user?.role === 'organizer';
  const isCollegeAdmin = user?.role === 'college_admin';
  const isPlatformAdmin = user?.role === 'platform_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isStudent,
        isOrganizer,
        isCollegeAdmin,
        isPlatformAdmin,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

