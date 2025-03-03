// src/components/DomainList.js
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

const DomainList = forwardRef(({ id }, ref) => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState({});

  // Fetch domains from backend.
  const fetchDomains = async () => {
    setLoading(true);
    try {
      const response = await api.get('/custom-domains/');
      // If DRF pagination is enabled, response.data might be an object with a "results" field.
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setDomains(data);
    } catch (error) {
      console.error('Error fetching domains:', error);
      toast.error('Failed to load domains.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  useImperativeHandle(ref, () => ({
    fetchDomains,
  }));

  const handleVerify = async (domainId) => {
    setVerifying((prev) => ({ ...prev, [domainId]: true }));
    try {
      await api.post(`/custom-domains/${domainId}/verify/`);
      toast.success('Domain verified successfully!');
      fetchDomains(); // Refresh the list after verification.
    } catch (error) {
      console.error('Verification error:', error);
      const errorMsg = error.response?.data?.error || 'Verification failed. Check your DNS settings.';
      toast.error(errorMsg);
    } finally {
      setVerifying((prev) => ({ ...prev, [domainId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={40} color="#3b82f6" />
      </div>
    );
  }

  return (
    <div id={id} className="max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-200">Your Custom Domains</h2>
      {domains.length === 0 ? (
        <p className="text-gray-400">No custom domains added yet.</p>
      ) : (
        <ul className="space-y-4">
          {domains.map((domain) => (
            <li
              key={domain.id}
              className="flex items-center justify-between py-3 border-b border-gray-600"
            >
              <div>
                <p className="font-medium text-gray-200">{domain.domain_name}</p>
                <p className="text-sm text-gray-400">
                  From: {domain.from_email || `no-reply@${domain.domain_name}`}
                </p>
                <p className="text-sm text-gray-400">
                  Status: {domain.is_verified ? 'Verified' : 'Unverified'}
                  {!domain.is_verified && (
                    <span className="ml-2 text-xs">
                      (TXT: {domain.verification_token})
                    </span>
                  )}
                </p>
              </div>
              {!domain.is_verified && (
                <button
                  onClick={() => handleVerify(domain.id)}
                  disabled={verifying[domain.id]}
                  className={`px-4 py-1 rounded-md text-white font-medium transition-colors ${
                    verifying[domain.id]
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {verifying[domain.id] ? (
                    <span className="flex items-center">
                      <ClipLoader size={16} color="#fff" className="mr-2" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export default DomainList;