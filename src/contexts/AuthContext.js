import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { api, setAuthToken } from '../utils/api';

/**
 * Authentication Context
 * Manages user authentication state and JWT token storage in memory
 * Provides secure token management without localStorage to prevent XSS
 */
const AuthContext = createContext();

// In-memory token storage for security
let inMemoryToken = null;

/**
 * Get the current auth token from memory
 * @returns {string|null} The current JWT token
 */
export const getAuthToken = () => inMemoryToken;

/**
 * Custom hook to use authentication context
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component that wraps the app with authentication context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // Store JWT in memory instead of localStorage for security
  const [token, setToken] = useState(inMemoryToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(inMemoryToken);

  // Update in-memory token when state changes
  const updateToken = (newToken) => {
    inMemoryToken = newToken;
    tokenRef.current = newToken;
    setToken(newToken);
  };

  /**
   * Login function that authenticates user and stores token
   * @param {string} identifier - User email or username
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (identifier, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { identifier, password });
      const { data } = response;
      const newToken = data?.data?.token || data?.token;
      const userData = data?.data?.user || data?.user;
      
      if (!newToken || !userData) {
        throw new Error('Invalid response from server');
      }
      
      // Store token in memory
      updateToken(newToken);
      setUser(userData);
      setAuthToken(newToken);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register function that creates new user account
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      const { data } = response;
      const newToken = data?.data?.token || data?.token;
      const newUser = data?.data?.user || data?.user;
      
      if (!newToken || !newUser) {
        throw new Error('Invalid response from server');
      }
      
      // Store token in memory
      updateToken(newToken);
      setUser(newUser);
      setAuthToken(newToken);
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout function that clears user data and token
   */
  const logout = async () => {
    try {
      // Call backend logout endpoint if token exists
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear token and user data
      updateToken(null);
      setUser(null);
      setAuthToken(null);
    }
  };

  /**
   * Verify token and get user data on app load
   */
  useEffect(() => {
    const verifyToken = async () => {
      const currentToken = tokenRef.current;
      if (currentToken) {
        try {
          setAuthToken(currentToken);
          const response = await api.get('/auth/me');
          const userData = response.data?.data?.user || response.data?.user;
          if (userData) {
            setUser(userData);
          } else {
            throw new Error('Invalid user data');
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          // Clear invalid token
          updateToken(null);
          setUser(null);
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const value = {
    token: tokenRef.current,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!tokenRef.current && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};


