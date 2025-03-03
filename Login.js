// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { obtainToken } from '../services/api'; // Secure API helper for token acquisition
import { useAuth } from '../contexts/AuthContext'; // AuthContext manages global auth state

/**
 * Login Component
 *
 * This component provides a secure login form for traditional username/password authentication
 * as well as a Google OAuth option. It ensures that credentials are transmitted securely,
 * updates global authentication state, and navigates to the protected dashboard upon success.
 *
 * Security measures include:
 * - Using HTTPS (assumed via backend configuration) and sending credentials with withCredentials.
 * - Storing JWT tokens (if used) in localStorage (or in production consider secure, HTTP-only cookies).
 * - Keeping the authentication state isolated so that subsequent requests are properly scoped.
 *
 * Note: The Google login flow remains unchanged and is handled by the backend.
 */
const Login = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  // Update form values securely on each input change.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Handle traditional login form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // obtainToken() securely sends credentials to the backend endpoint.
      const data = await obtainToken(credentials.username, credentials.password);
      // Store tokens locally – in production, consider using secure HTTP-only cookies.
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Update the global authentication state.
      setIsAuthenticated(true);
      toast.success('Logged in successfully!');
      // Navigate to the protected dashboard.
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Invalid username or password.');
    }
  };

  // Initiate Google OAuth flow without altering existing logic.
  const handleGoogleLogin = async () => {
    try {
      const response = await api.get('/auth/google/init/', { withCredentials: true });
      const { authorization_url } = response.data;
      // Redirect the user to the Google OAuth authorization URL.
      window.location.href = authorization_url;
    } catch (error) {
      console.error('Google Login failed:', error);
      toast.error('Failed to initiate Google login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg shadow-xl border border-gray-700">
        <h2
          className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#FFD700]"
          style={{ textShadow: '0 0 8px rgba(255, 200, 0, 0.6)' }}
        >
          Login to ENAI
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FFD700]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FFD700]"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#FF8C00] to-[#FFD700] hover:opacity-90 focus:outline-none transition"
          >
            Login
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none transition"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 488 512" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.5 0 123.7 24.5 166.3 64.9l-67.3 64.9C276.5 113.6 259.6 112 248 112c-89.5 0-162 72.5-162 162s72.5 162 162 162c98.6 0 135.4-78.3 140.8-119.3H248v-95h236.8c2.3 12.5 3.2 24.9 3.2 38.3z"
              />
            </svg>
            Login with Google
          </button>
        </div>

        <p className="text-gray-400 mt-4 text-center">
          Don’t have an account?{' '}
          <Link to="/register" className="text-[#FF8C00] hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;