// src/pages/Emails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchEmails, deleteEmail, sendTestEmail } from '../services/api';
import EmailTable from '../components/EmailTable';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import SendTestEmailModal from '../components/SendTestEmailModal';
import debounce from 'lodash/debounce';
import sanitizeHtml from 'sanitize-html';

// Mock filter options (since backend doesn’t provide these dynamically)
const statusOptions = ['', 'draft', 'sent', 'failed'];
const leadEmailOptions = ['', 'john.doe@example.com', 'jane.smith@example.com']; // Mock data
const campaignNameOptions = ['', 'Q1 Outreach', 'Q2 Follow-up']; // Mock data

const Emails = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ status: '', lead__email: '', campaign__name: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const navigate = useNavigate();

  // Fetch emails with retry logic
  const fetchWithRetry = useCallback(async (apiFunc, params, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await apiFunc(params);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }, []);

  const fetchEmailsData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(false);
    try {
      const params = {
        page,
        status: filters.status,
        'lead__email': filters.lead__email,
        'campaign__name': filters.campaign__name,
        search: sanitizeHtml(searchQuery),
        ordering,
      };
      const response = await fetchWithRetry(fetchEmails, params);
      setEmails(response.results || []);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.count / 25));
    } catch (err) {
      setError(true);
      toast.error('Failed to fetch emails after retries.');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, ordering]);

  useEffect(() => {
    fetchEmailsData(currentPage);
  }, [currentPage, fetchEmailsData]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this email?')) return;
    try {
      await fetchWithRetry(() => deleteEmail(id));
      setEmails(prev => prev.filter(email => email.id !== id));
      toast.success('Email deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete the email.');
    }
  }, []);

  const handleSendTest = useCallback((id) => {
    setSelectedEmailId(id);
    setIsTestModalOpen(true);
  }, []);

  const handleSendTestEmail = useCallback(async (testRecipient) => {
    try {
      await fetchWithRetry(() => sendTestEmail(selectedEmailId, { test_recipient: sanitizeHtml(testRecipient) }));
      toast.success('Test email sent successfully.');
      setIsTestModalOpen(false);
    } catch (err) {
      toast.error('Failed to send test email.');
    }
  }, [selectedEmailId]);

  const debouncedSearch = useCallback(debounce((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 500), []);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    setOrdering(prev => prev === field ? `-${field}` : field);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-white">
        <div className="animate-pulse">Loading emails...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-red-400">
        <div>
          Error fetching emails.
          <button onClick={() => fetchEmailsData(currentPage)} className="ml-2 text-blue-500 underline" aria-label="Retry fetching emails">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Emails</h1>
        <Link
          to="/dashboard/emails/add/"
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
          aria-label="Add new email"
        >
          Add Email
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search emails..."
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-64 px-4 py-2 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          aria-label="Search emails"
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="px-4 py-2 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          aria-label="Filter by status"
        >
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
        <select
          name="lead__email"
          value={filters.lead__email}
          onChange={handleFilterChange}
          className="px-4 py-2 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          aria-label="Filter by lead email"
        >
          {leadEmailOptions.map(opt => (
            <option key={opt} value={opt}>{opt || 'All Leads'}</option>
          ))}
        </select>
        <select
          name="campaign__name"
          value={filters.campaign__name}
          onChange={handleFilterChange}
          className="px-4 py-2 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
          aria-label="Filter by campaign name"
        >
          {campaignNameOptions.map(opt => (
            <option key={opt} value={opt}>{opt || 'All Campaigns'}</option>
          ))}
        </select>
      </div>

      {/* Emails Table */}
      <EmailTable
        emails={emails}
        onView={id => navigate(`/dashboard/emails/${id}/`)}
        onEdit={id => navigate(`/dashboard/emails/${id}/edit/`)}
        onDelete={handleDelete}
        onSendTest={handleSendTest}
        onSortChange={handleSortChange}
        currentOrdering={ordering}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Send Test Email Modal */}
      {isTestModalOpen && (
        <SendTestEmailModal
          isOpen={isTestModalOpen}
          closeModal={() => setIsTestModalOpen(false)}
          onSend={handleSendTestEmail}
        />
      )}
    </div>
  );
};

export default Emails;