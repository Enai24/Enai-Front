// src/components/CustomDomainForm.js
import React, { useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const CustomDomainForm = ({ onDomainAdded }) => {
  const [domain, setDomain] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);

  const cleanDomain = (input) => {
    // Remove protocol and path, keep only hostname
    const parsed = new URL(input.includes('://') ? input : `http://${input}`);
    return parsed.hostname;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let cleanedDomain;
    try {
      cleanedDomain = cleanDomain(domain);
    } catch (error) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }

    if (!cleanedDomain.includes('.')) {
      toast.error('Please enter a valid domain (e.g., example.com)');
      return;
    }
    if (fromEmail && !fromEmail.includes('@')) {
      toast.error('Please enter a valid email address (e.g., sales@example.com)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/custom-domains/', { 
        domain_name: cleanedDomain,
        from_email: fromEmail || undefined
      });
      setVerificationToken(response.data.verification_token);
      toast.success(`Domain added! Add this TXT record to your DNS: ${response.data.verification_token}`);
      setDomain('');
      setFromEmail('');
      if (onDomainAdded) onDomainAdded();
    } catch (error) {
      console.error('Error adding domain:', error);
      toast.error(error.response?.data?.detail || 'Failed to add domain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-200 mb-4">Add Custom Domain</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="domain" className="block text-sm font-medium text-gray-300">
            Domain Name
          </label>
          <input
            type="text"
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value.trim())}
            placeholder="e.g., example.com"
            className="mt-1 w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            required
          />
        </div>
        <div>
          <label htmlFor="fromEmail" className="block text-sm font-medium text-gray-300">
            From Email (optional)
          </label>
          <input
            type="email"
            id="fromEmail"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value.trim())}
            placeholder="e.g., sales@yourdomain.com"
            className="mt-1 w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <ClipLoader size={20} color="#fff" className="mr-2" />
              Adding...
            </span>
          ) : (
            'Add Domain'
          )}
        </button>
      </form>
      {verificationToken && (
        <div className="mt-4 p-4 bg-gray-700 rounded-md border border-gray-600">
          <p className="text-sm text-gray-300">
            Verification Token: <span className="font-mono font-semibold">{verificationToken}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Add this as a TXT record in your DNS settings to verify ownership.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomDomainForm;