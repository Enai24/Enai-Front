// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // ✅ Use 'react-dom/client' for React 18
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import './styles/styles.css';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext'; // ✅ Import AuthProvider

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider> {/* ✅ Wrap your App with AuthProvider */}
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();