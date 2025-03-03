// src/pages/GmailCallback.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext'; // if you have a context

const GmailCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth(); // if you have a context

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const access = query.get('access');
    const refresh = query.get('refresh');
    const success = query.get('success');
    const error = query.get('error');

    // 1) If Google returned an error
    if (error) {
      toast.error('Google OAuth failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    // 2) If success=google_connected & we have tokens
    if (success === 'google_connected' && access) {
      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);

      // (Optional) Let your AuthContext know the user is now authenticated
      setIsAuthenticated(true);

      // Debug logs
      console.log('Access Token:', access);
      console.log('Refresh Token:', refresh);

      toast.success('Google sign-in successful!');
      // Redirect to your main “Home”
      navigate('/', { replace: true });
    } else {
      toast.error('Google OAuth failed. Missing tokens.');
      navigate('/login', { replace: true });
    }
  }, [location, navigate, setIsAuthenticated]);

  return <div>Processing Google OAuth...</div>;
};

export default GmailCallback;