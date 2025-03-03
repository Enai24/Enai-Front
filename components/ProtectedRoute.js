// frontend/src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('access_token');  // Adjust based on your auth strategy

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;