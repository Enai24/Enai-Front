import React, { useState, useEffect } from 'react';
import { FaLinkedin, FaFacebook, FaTwitter, FaYoutube, FaCopy, FaBuilding, FaGlobe, FaUsers } from 'react-icons/fa';
import { addLeadsFromSearch } from '../services/api';
import { toast } from 'react-toastify';

const DomainSearchResult = ({ data }) => {
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isAdding, setIsAdding] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Initialize filtered emails from data
  useEffect(() => {
    if (data?.emails) {
      setFilteredEmails(data.emails);
    }
  }, [data]);

  // Handle checkbox selection
  const handleCheckboxChange = (email, isChecked) => {
    setSelectedEmails((prev) =>
      isChecked ? [...prev, email] : prev.filter((e) => e !== email)
    );
  };

  // Select all emails
  const handleSelectAll = (isChecked) => {
    setSelectedEmails(isChecked ? filteredEmails.map((e) => e.value) : []);
  };

  // Filter emails by confidence
  const handleConfidenceFilter = (e) => {
    const value = Number(e.target.value);
    setConfidenceFilter(value);
    setFilteredEmails(data.emails.filter((email) => (email.confidence || 0) >= value));
  };

  // Sort table by column
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sorted = [...filteredEmails].sort((a, b) => {
      if (key === 'value') return direction === 'asc' ? a[key].localeCompare(b[key]) : b[key].localeCompare(a[key]);
      const aValue = a[key] || (key === 'confidence' ? 0 : 'N/A');
      const bValue = b[key] || (key === 'confidence' ? 0 : 'N/A');
      return direction === 'asc' ? (typeof aValue === 'string' ? aValue.localeCompare(bValue) : aValue - bValue) : (typeof bValue === 'string' ? bValue.localeCompare(aValue) : bValue - aValue);
    });
    setFilteredEmails(sorted);
  };

  // Copy email to clipboard
  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    toast.success(`Copied ${email} to clipboard!`);
  };

  // Send selected leads to backend
  const handleAddLeads = async () => {
    if (selectedEmails.length === 0) {
      toast.error('No emails selected!');
      return;
    }

    setIsAdding(true);
    try {
      const response = await addLeadsFromSearch(selectedEmails, data.domain_search_id);
      toast.success(response.message || 'Leads added successfully!');
      setSelectedEmails([]);
      setShowConfirm(false);
    } catch (error) {
      toast.error('Failed to add leads.');
    } finally {
      setIsAdding(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        handleSelectAll(true);
      } else if (e.key === 'Enter' && selectedEmails.length > 0) {
        setShowConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEmails]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700/50 text-center">
          No results found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-200 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <div>
            <h2 className="text-3xl font-bold text-white">
              {data.organization || data.domain}
              <span className="text-sm font-normal text-gray-400 ml-2">({data.domain})</span>
            </h2>
            <p className="text-gray-300 mt-1">Domain Search Results</p>
          </div>
          <a
            href={`https://${data.domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
            aria-label="Visit company website"
          >
            <FaGlobe /> Visit Website
          </a>
        </header>

        {/* Company Information */}
        <section className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaBuilding className="mr-2" /> Company Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p><strong className="text-gray-300">Organization:</strong> {data.organization || 'N/A'}</p>
              <p><strong className="text-gray-300">Industry:</strong> {data.industry || 'N/A'}</p>
              <p><strong className="text-gray-300">Country:</strong> {data.country || 'N/A'}</p>
              <p><strong className="text-gray-300">City:</strong> {data.city || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <p><strong className="text-gray-300">Employees:</strong> {data.employee_count || 'N/A'}</p>
              <p><strong className="text-gray-300">Revenue:</strong> {data.revenue_range || 'N/A'}</p>
              <p><strong className="text-gray-300">Founded:</strong> {data.founded_year || 'N/A'}</p>
              <p><strong className="text-gray-300">Description:</strong> {data.description || 'No description available'}</p>
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4">Social Presence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              {data.linkedin ? (
                <a
                  href={data.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <FaLinkedin /> LinkedIn
                </a>
              ) : (
                <span className="text-gray-500 flex items-center gap-2"><FaLinkedin /> LinkedIn: N/A</span>
              )}
            </div>
            <div>
              {data.facebook ? (
                <a
                  href={data.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <FaFacebook /> Facebook
                </a>
              ) : (
                <span className="text-gray-500 flex items-center gap-2"><FaFacebook /> Facebook: N/A</span>
              )}
            </div>
            <div>
              {data.twitter ? (
                <a
                  href={data.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <FaTwitter /> Twitter
                </a>
              ) : (
                <span className="text-gray-500 flex items-center gap-2"><FaTwitter /> Twitter: N/A</span>
              )}
            </div>
            <div>
              {data.youtube ? (
                <a
                  href={data.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <FaYoutube /> YouTube
                </a>
              ) : (
                <span className="text-gray-500 flex items-center gap-2"><FaYoutube /> YouTube: N/A</span>
              )}
            </div>
          </div>
        </section>

        {/* Email Addresses */}
        <section className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700/50">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaUsers className="mr-2" /> Leads ({filteredEmails.length})
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <label className="text-sm font-medium text-gray-300">Filter by Confidence:</label>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="range"
                min="0"
                max="100"
                value={confidenceFilter}
                onChange={handleConfidenceFilter}
                className="w-full sm:w-64 accent-blue-500"
                aria-label="Filter emails by confidence level"
              />
              <span className="text-sm text-gray-400">{confidenceFilter}%+</span>
            </div>
          </div>
          {data.emails && data.emails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full bg-gray-700 rounded-lg shadow-md border border-gray-600">
                <thead className="bg-gray-600 text-gray-200">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('value')}
                    >
                      Email {sortConfig.key === 'value' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('confidence')}
                    >
                      Confidence {sortConfig.key === 'confidence' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-sm font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('position')}
                    >
                      Position {sortConfig.key === 'position' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium">
                      <input
                        type="checkbox"
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        checked={selectedEmails.length === filteredEmails.length && filteredEmails.length > 0}
                        className="h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        aria-label="Select all emails"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmails.map((email, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-600 hover:bg-gray-600 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <span className="text-gray-300 truncate max-w-xs" title={email.value}>{email.value}</span>
                        <FaCopy
                          className="cursor-pointer text-gray-400 hover:text-blue-400 transition-colors duration-200"
                          onClick={() => handleCopyEmail(email.value)}
                          aria-label={`Copy ${email.value} to clipboard`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                            email.confidence >= 80 ? 'bg-green-900 text-green-300' :
                            email.confidence >= 50 ? 'bg-yellow-900 text-yellow-300' :
                            'bg-red-900 text-red-300'
                          }`}
                        >
                          {email.confidence ? `${email.confidence}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{email.position || 'N/A'}</td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(email.value)}
                          onChange={(e) => handleCheckboxChange(email.value, e.target.checked)}
                          className="h-5 w-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          aria-label={`Select email ${email.value}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">No emails found for this domain.</p>
          )}
        </section>

        {/* Add Leads Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isAdding || selectedEmails.length === 0}
            className={`flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed`}
            aria-label={`Add ${selectedEmails.length} selected leads`}
          >
            {isAdding && (
              <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z" />
              </svg>
            )}
            Add Selected Leads ({selectedEmails.length})
          </button>
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl shadow-xl border border-gray-700/50 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">Confirm Adding Leads</h3>
              <p className="text-gray-300 mb-6">
                You are about to add <strong>{selectedEmails.length}</strong> lead{selectedEmails.length > 1 ? 's' : ''} from {data.domain}. Continue?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                  aria-label="Cancel adding leads"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLeads}
                  disabled={isAdding}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed`}
                  aria-label="Confirm adding leads"
                >
                  {isAdding ? 'Adding...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainSearchResult;