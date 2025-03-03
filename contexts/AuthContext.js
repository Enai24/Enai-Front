import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider manages the global authentication state.
 * It verifies the session on mount, listens for storage changes
 * (to handle multi-tab logouts), and clears sensitive data if the token is removed.
 */
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Function to clear authentication state
  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      clearAuth();
      return;
    }
    // Call the session check endpoint to verify the token
    api.get('/auth/session/', { withCredentials: true })
      .then((response) => {
        // If the session is valid, update the auth state.
        setIsAuthenticated(true);
        setUser({
          username: response.data.username,
          email: response.data.email,
        });
      })
      .catch(() => {
        // If the token is invalid or an error occurs, clear auth.
        clearAuth();
      });

    // Listen for storage events in case the user logs out in another tab.
    const handleStorageChange = (e) => {
      if (e.key === 'access_token' && !e.newValue) {
        clearAuth();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Logout function calls backend logout endpoint and clears state.
  const logout = () => {
    api.post('/logout/', {}) // Now CSRF token is sent automatically
      .finally(() => {
        clearAuth();
      });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);