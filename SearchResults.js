import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDomainSearchById } from '../services/api';
import DomainSearchResult from '../components/DomainSearchResult';
import { toast } from 'react-toastify';

const SearchResults = () => {
  const { id, unique_token } = useParams();
  const navigate = useNavigate();
  const [domainSearch, setDomainSearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const pollingInterval = useRef(null);

  const fetchSearchResults = async () => {
    try {
      const data = await fetchDomainSearchById(id, unique_token);
      setDomainSearch(data);
      setLoading(false);

      if (data.status === 'Completed') {
        toast.success('Domain search completed.');
        clearInterval(pollingInterval.current);
      } else if (data.status === 'Failed') {
        setError(true);
        toast.error('Domain search failed.');
        clearInterval(pollingInterval.current);
      }
    } catch (err) {
      console.error('Error fetching domain search results:', err);
      setError(true);
      setLoading(false);
      toast.error('Failed to fetch domain search results.');
      clearInterval(pollingInterval.current);
    }
  };

  useEffect(() => {
    fetchSearchResults();

    if (!domainSearch || (domainSearch?.status !== 'Completed' && domainSearch?.status !== 'Failed')) {
      pollingInterval.current = setInterval(fetchSearchResults, 3000);
    }

    return () => clearInterval(pollingInterval.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, unique_token, domainSearch?.status]);

  const handleAddLeads = (emails) => {
    if (emails && emails.length > 0) {
      console.log('Selected Emails:', emails);
      toast.success('Leads added successfully.');
      navigate('/dashboard/leads/');
    } else {
      toast.error('No emails to add as leads.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-lg font-medium">Loading search results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700/50 text-gray-200 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Error</h2>
          <p className="text-gray-300 mb-6">
            Failed to retrieve domain information. Please try again later.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard/discover-domain')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md"
              aria-label="Try searching another domain"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard/leads')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
              aria-label="Go to leads page"
            >
              Leads Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700/50">
        {domainSearch?.status === 'Completed' ? (
          <DomainSearchResult data={domainSearch.search_data} onAddLeads={handleAddLeads} />
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Search in Progress</h2>
            <div className="flex justify-center items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-300">
                Your domain search is currently in progress. Please wait for the results.
              </p>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => navigate('/dashboard/discover-domain')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 shadow-md"
            aria-label="Back to discover domain page"
          >
            Back to Discover
          </button>
          <button
            onClick={() => navigate('/dashboard/leads')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
            aria-label="Go to leads page"
          >
            Leads Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;