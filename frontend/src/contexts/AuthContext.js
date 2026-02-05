import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe, createSession, logout as logoutApi } from '../lib/api';

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

  const checkAuth = useCallback(async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = () => {
    // LOCAL LOGIN BYPASS (Removing Emergent Dependency)
    // For development, we just redirect to the callback with a mock session_id
    const mockSessionId = 'mock_' + Math.random().toString(36).substring(7);
    window.location.href = `/dashboard#session_id=${mockSessionId}`;
  };

  const handleSessionId = async (sessionId) => {
    try {
      const res = await createSession(sessionId);
      setUser(res.data);
      return res.data;
    } catch (error) {
      console.error('Session error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, handleSessionId, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
