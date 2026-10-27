import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('gitpulse_token');
      setUser(null);
    };

    window.addEventListener('gitpulse:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('gitpulse:unauthorized', handleUnauthorized);
  }, []);

  const loginWithGithub = () => {
    const apiUrl =
      import.meta.env.VITE_API_URL ||
      (import.meta.env.PROD
        ? 'https://git-pulse-mern-end-term-project.onrender.com/api'
        : 'http://localhost:5000/api');
    window.location.href = `${apiUrl}/auth/github`;
  };

  const setAuthToken = (token) => {
    localStorage.setItem('token', token);
    return checkAuth();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGithub,
        setAuthToken,
        logout,
        checkAuth,
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
