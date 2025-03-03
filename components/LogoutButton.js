// src/components/LogoutButton.jsx
import React, { useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

/**
 * LogoutButton Component
 *
 * Securely logs out the authenticated user by calling the backend logout endpoint.
 * It clears stored tokens, updates the global authentication state,
 * and navigates the user to the login page.
 *
 * Advanced security measures include:
 * - Using withCredentials to ensure session cookies are cleared.
 * - Removing any stored tokens from localStorage.
 */
const LogoutButton = () => {
  const { setIsAuthenticated } = useContext(useAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Securely call the backend logout endpoint to flush session data.
      await axios.get('/logout/', { withCredentials: true });
      // Clear any locally stored tokens.
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      // Update global auth state.
      setIsAuthenticated(false);
      toast.success('Logged out successfully!');
      // Redirect user to login page.
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out.');
    }
  };

  return (
    <button onClick={handleLogout} className="w-full py-2 px-4 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none transition">
      Logout
    </button>
  );
};

export default LogoutButton;