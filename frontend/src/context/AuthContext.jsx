import React, { createContext, useContext, useState, useEffect } from 'react';
import { cognitoAuth } from '../services/cognitoAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session from sessionStorage on initial load
  useEffect(() => {
    try {
      const session = cognitoAuth.getSession();
      if (session && session.user) {
        setUser(session.user);
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const authenticatedUser = await cognitoAuth.signIn(email, password);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const signup = async (email, password, options = {}) => {
    setAuthError(null);
    try {
      return await cognitoAuth.signUp(email, password, options);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const confirm = async (email, code) => {
    setAuthError(null);
    try {
      return await cognitoAuth.confirmSignUp(email, code);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = () => {
    cognitoAuth.signOut();
    setUser(null);
    setAuthError(null);
  };

  const isHospitalStaff = Boolean(
    user && ['HOSPITAL_STAFF', 'ADMIN', 'BLOOD_BANK_MANAGER'].includes(user.role)
  );

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isHospitalStaff,
    loading,
    authError,
    login,
    signup,
    confirm,
    logout,
    clearError: () => setAuthError(null)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

