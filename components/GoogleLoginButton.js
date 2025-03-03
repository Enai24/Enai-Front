import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'react-toastify';

const GoogleLoginButton = () => {
  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email openid',
    onSuccess: async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/auth/google/init/', {
          withCredentials: true,
        });
        const { authorization_url } = response.data;
        window.location.href = authorization_url;
      } catch (error) {
        console.error('Error initiating Google OAuth:', error);
        toast.error('Failed to initiate Google OAuth.');
      }
    },
    onError: (error) => {
      console.error('Google Login failed:', error);
      toast.error('Google login failed. Please try again.');
    },
  });

  return (
    <button
      onClick={() => login()}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
    >
      <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;