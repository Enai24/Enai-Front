// src/pages/DiscoverDomain.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createDomainSearch } from '../services/api';
import DiscoverDomainForm from '../components/DiscoverDomainForm';
import { toast } from 'react-toastify';

const DiscoverDomain = () => {
  const navigate = useNavigate();

  const handleSearch = async (domain) => {
    try {
      const response = await createDomainSearch({ domain });
      console.log('Domain Search Response:', response); // Debugging line
      const { id, unique_token, user } = response; // Destructure user if available
      toast.success('Domain search initiated successfully.');
      toast.info(`Searching for domain: ${domain}`);

      // Redirect to search results page with the correct ID and unique_token
      if (user) {
        // Authenticated user
        navigate(`/dashboard/search-results/${id}/`);
      } else {
        // Anonymous user
        navigate(`/dashboard/search-results/${id}/${unique_token}/`);
      }
    } catch (error) {
      console.error('Error initiating domain search:', error);
      toast.error('Failed to initiate domain search.');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded shadow">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">Discover Domain</h1>
      <DiscoverDomainForm onSearch={handleSearch} />
    </div>
  );
};

export default DiscoverDomain;