// src/pages/Inbox.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Filter, Star, AlertCircle, RefreshCw,
  Archive, Trash2, MoreHorizontal, Reply, Send, X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../services/api'; // Your Axios instance with auth
import { fetchInboxData, fetchAiSuggestion } from '../services/api';
import { ClipLoader } from 'react-spinners'; // For loading states

// Status badges with consistent styling
function getStatusBadge(status) {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ';
  switch (status?.toLowerCase()) {
    case 'sent':
      return `${baseStyle} bg-green-600 text-white`;
    case 'delivered':
      return `${baseStyle} bg-blue-600 text-white`;
    case 'bounced':
    case 'undelivered':
      return `${baseStyle} bg-red-600 text-white`;
    case 'auto_response':
      return `${baseStyle} bg-purple-600 text-white`;
    default:
      return `${baseStyle} bg-gray-600 text-white`;
  }
}

export default function Inbox() {
  const [activeTab, setActiveTab] = useState('human');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [loading, setLoading] = useState(false);
  const [humanReplies, setHumanReplies] = useState([]);
  const [autoResponses, setAutoResponses] = useState([]);
  const [undelivered, setUndelivered] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null); // For viewing full email
  const [composeOpen, setComposeOpen] = useState(false); // Compose/reply modal
  const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });
  const [page, setPage] = useState(1); // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const wsRef = useRef(null); // WebSocket for real-time updates

  // Fetch inbox data with pagination
  const fetchEmails = useCallback(async (resetPage = false) => {
    setLoading(true);
    try {
      const response = await api.get('/inbox/', {
        params: {
          page: resetPage ? 1 : page,
          search: searchTerm,
          campaign: filterCampaign === 'all' ? undefined : filterCampaign,
        },
      });
      const { humanReplies, autoResponses, undelivered, total_pages } = response.data;
      if (resetPage) setPage(1);
      setHumanReplies(humanReplies || []);
      setAutoResponses(autoResponses || []);
      setUndelivered(undelivered || []);
      setTotalPages(total_pages || 1);
      toast.success('Inbox refreshed successfully.');
    } catch (error) {
      console.error('Error fetching inbox data:', error);
      toast.error('Failed to load inbox. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, filterCampaign]);

  // WebSocket for real-time email updates
  useEffect(() => {
    const backendHost = process.env.REACT_APP_BACKEND_HOST || 'localhost:8000';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    wsRef.current = new WebSocket(`${protocol}://${backendHost}/ws/inbox/`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected to inbox');
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_email') {
        toast.info('New email received!');
        fetchEmails(); // Refresh inbox
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast.error('Real-time updates unavailable.');
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      wsRef.current.close();
    };
  }, [fetchEmails]);

  // Initial fetch and search/filter updates
  useEffect(() => {
    fetchEmails(true); // Reset page on search/filter change
  }, [searchTerm, filterCampaign]);

  // Manual refresh
  const handleRefresh = () => {
    fetchEmails(true);
  };

  // Reply/Compose handlers
  const handleReply = (email) => {
    setComposeData({
      to: email.email || email.from,
      subject: `Re: ${email.subject}`,
      body: `\n\nOn ${new Date(email.timestamp).toLocaleString()}, ${email.from} wrote:\n> ${email.preview}`,
    });
    setComposeOpen(true);
  };

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject || !composeData.body.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }
    try {
      await api.post('/inbox/send/', composeData); // Assumes custom domain is used via backend
      toast.success('Email sent successfully!');
      setComposeOpen(false);
      setComposeData({ to: '', subject: '', body: '' });
      fetchEmails();
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email.');
    }
  };

  // Archive/Delete handlers
  const handleArchive = async (email) => {
    try {
      await api.post(`/inbox/${email.id}/archive/`);
      toast.success('Email archived.');
      fetchEmails();
    } catch (error) {
      toast.error('Failed to archive email.');
    }
  };

  const handleDelete = async (email) => {
    try {
      await api.post(`/inbox/${email.id}/delete/`);
      toast.success('Email deleted.');
      fetchEmails();
    } catch (error) {
      toast.error('Failed to delete email.');
    }
  };

  // AI Suggestion
  const handleAISuggestion = async (messageId) => {
    try {
      const { ai_suggested_reply } = await fetchAiSuggestion(messageId);
      setComposeData((prev) => ({ ...prev, body: ai_suggested_reply }));
      setComposeOpen(true);
      toast.info('AI suggestion loaded into compose window.');
    } catch (error) {
      console.error('Error fetching AI suggestion:', error);
      toast.error('Failed to fetch AI suggestion.');
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <main className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Inbox</h1>
            <p className="text-gray-400 mt-1">Manage all your email responses</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-gray-200"
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 hover:bg-gray-700 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <button
              onClick={() => setComposeOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Compose
            </button>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
          {/* Tabs */}
          <div className="border-b border-gray-700 flex">
            {['human', 'auto', 'undelivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-gray-300 text-gray-300'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                {tab === 'human' && `Human Replies (${humanReplies.length})`}
                {tab === 'auto' && `Auto-Responses (${autoResponses.length})`}
                {tab === 'undelivered' && `Undelivered (${undelivered.length})`}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-700 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            <select
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              disabled={loading}
            >
              <option value="all">All Campaigns</option>
              <option value="enterprise">Enterprise Q1</option>
              <option value="midmarket">Mid-Market Outreach</option>
              <option value="startups">Tech Startups</option>
            </select>
          </div>

          {/* Email List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <ClipLoader size={40} color="#3b82f6" />
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {activeTab === 'human' && (
                humanReplies.length === 0 ? (
                  <p className="p-4 text-gray-400">No human replies found.</p>
                ) : (
                  humanReplies.map((email) => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      onReply={handleReply}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onAISuggestion={handleAISuggestion}
                      onSelect={setSelectedEmail}
                    />
                  ))
                )
              )}
              {activeTab === 'auto' && (
                autoResponses.length === 0 ? (
                  <p className="p-4 text-gray-400">No auto-responses found.</p>
                ) : (
                  autoResponses.map((email) => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      onReply={handleReply}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onAISuggestion={handleAISuggestion}
                      onSelect={setSelectedEmail}
                    />
                  ))
                )
              )}
              {activeTab === 'undelivered' && (
                undelivered.length === 0 ? (
                  <p className="p-4 text-gray-400">No undelivered emails found.</p>
                ) : (
                  undelivered.map((email) => (
                    <EmailRow
                      key={email.id}
                      email={email}
                      onDelete={handleDelete}
                      onSelect={setSelectedEmail}
                      isUndelivered
                    />
                  ))
                )
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 flex justify-between items-center border-t border-gray-700">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-400">Page {page} of {totalPages}</span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Email Detail Modal */}
        {selectedEmail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-200">{selectedEmail.subject}</h2>
                <button onClick={() => setSelectedEmail(null)} className="text-gray-400 hover:text-gray-200">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-400">From: {selectedEmail.from} &lt;{selectedEmail.email}&gt;</p>
              <p className="text-gray-400 mt-2">To: {selectedEmail.to}</p>
              <p className="text-gray-400 mt-2">Date: {new Date(selectedEmail.timestamp).toLocaleString()}</p>
              <div className="mt-4 text-gray-200 whitespace-pre-wrap">{selectedEmail.body || selectedEmail.preview}</div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    handleReply(selectedEmail);
                    setSelectedEmail(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reply
                </button>
                <button
                  onClick={() => handleAISuggestion(selectedEmail.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  AI Suggestion
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compose Modal */}
        {composeOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-200">{composeData.subject ? 'Reply' : 'Compose'}</h2>
                <button onClick={() => setComposeOpen(false)} className="text-gray-400 hover:text-gray-200">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <input
                type="text"
                placeholder="To"
                className="w-full px-4 py-2 mb-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500"
                value={composeData.to}
                onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full px-4 py-2 mb-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500"
                value={composeData.subject}
                onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
              />
              <textarea
                placeholder="Type your message..."
                className="w-full px-4 py-2 mb-4 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 h-40"
                value={composeData.body}
                onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
              />
              <button
                onClick={handleSendEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Reusable Email Row Component
const EmailRow = ({ email, onReply, onArchive, onDelete, onAISuggestion, onSelect, isUndelivered }) => (
  <div className="p-4 hover:bg-gray-700 transition-colors cursor-pointer" onClick={() => onSelect(email)}>
    <div className="flex items-start gap-4">
      {!isUndelivered ? (
        <button className="p-1 text-gray-400 hover:text-yellow-300">
          <Star className={`h-5 w-5 ${email.starred ? 'fill-yellow-300 text-yellow-300' : ''}`} />
        </button>
      ) : (
        <div className="p-1 text-red-400">
          <AlertCircle className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-sm font-medium ${email.unread && !isUndelivered ? 'text-gray-100' : 'text-gray-400'}`}>
              {isUndelivered ? email.to : email.from}
            </h3>
            {!isUndelivered && <p className="text-sm text-gray-500">{email.email}</p>}
          </div>
          <span className="text-sm text-gray-400">{new Date(email.timestamp).toLocaleTimeString()}</span>
        </div>
        <h4 className={`text-sm mt-1 ${email.unread && !isUndelivered ? 'font-medium text-gray-100' : 'text-gray-400'}`}>
          {email.subject}
        </h4>
        <p className="text-sm text-gray-500 mt-1 truncate">{email.preview}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className={getStatusBadge(isUndelivered ? email.reason : email.status || email.type)}>
            {(isUndelivered ? email.reason : email.status || email.type)?.replace('_', ' ')}
          </span>
          {isUndelivered && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
              {email.bounceType} bounce
            </span>
          )}
          <span className="text-xs text-gray-400">{email.campaign}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isUndelivered && (
          <>
            <button className="p-1 text-gray-400 hover:text-gray-300" onClick={(e) => { e.stopPropagation(); onReply(email); }}>
              <Reply className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-300" onClick={(e) => { e.stopPropagation(); onArchive(email); }}>
              <Archive className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-400 hover:text-gray-300" onClick={(e) => { e.stopPropagation(); onAISuggestion(email.id); }}>
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </>
        )}
        <button className="p-1 text-gray-400 hover:text-gray-300" onClick={(e) => { e.stopPropagation(); onDelete(email); }}>
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);