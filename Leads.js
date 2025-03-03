// src/pages/Leads.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchLeads,
  deleteLead,
  bulkActions,
  addLeadsFromSearch,
  updateLeadAIScore,  // New API for AI scoring
  enrichLeadData,     // New API for enrichment
} from '../services/api';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import { toast } from 'react-toastify';
import AssignLeadDropdown from '../components/AssignLeadDropdown';
import BulkImport from '../components/BulkImport';
import debounce from 'lodash/debounce';
import useWebSocket from '../utils/useWebSocket';
import { Search, Plus, Download, RefreshCw } from 'lucide-react';

const Leads = () => {
  // State variables
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    industry: '',
    company_size: '',
    country: '',
    tags: '',
    min_ai_score: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [ordering, setOrdering] = useState('-ai_lead_score'); // Default sort by AI score

  const navigate = useNavigate();

  // Static filter values
  const industries = [
    'Technology', 'SaaS', 'Cloud Services', 'E-commerce', 
    'FinTech', 'Healthcare Tech', 'AI/ML', 'Web3', 
    'Digital Health', 'Manufacturing', 'Retail', 
    'Professional Services', 'Media & Entertainment'
  ];
  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees', 
    '201-500 employees', '501-1000 employees', '1001-5000 employees', 
    '5000+ employees'
  ];

  // Fetch leads data with retry logic
  const fetchLeadsData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(false);
    try {
      const params = {
        page,
        status: filters.status || undefined,
        source: filters.source || undefined,
        industry: filters.industry || undefined,
        company_size: filters.company_size || undefined,
        country: filters.country || undefined,
        tags: filters.tags || undefined,
        min_ai_score: filters.min_ai_score || undefined,
        search: searchQuery || undefined,
        ordering,
      };
      const response = await fetchLeads(params);
      setLeads(response.results || []);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.count / (response.page_size || 25)));
    } catch (err) {
      setError(true);
      toast.error('Failed to fetch leads.');
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, ordering]);

  useEffect(() => {
    fetchLeadsData(currentPage);
  }, [fetchLeadsData, currentPage]);

  // Debounce search input to avoid unnecessary requests
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 500),
    []
  );
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Global WebSocket for leads updates
  const wsStatus = useWebSocket("/ws/leads/", () => {
    fetchLeadsData(currentPage);
  });
  console.log("WebSocket status (Leads):", wsStatus);

  // Action handlers
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast.success('Lead deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete the lead.');
    }
  };

  const handleBulkAction = async (action, additionalData = {}) => {
    if (!selectedLeads.length) {
      toast.warning('No leads selected.');
      return;
    }
    if (action === 'delete' && !window.confirm('Are you sure you want to delete selected leads?')) return;
    try {
      await bulkActions({ bulk_action: action, selected_leads: selectedLeads, ...additionalData });
      toast.success(`Bulk action "${action}" completed.`);
      setSelectedLeads([]);
      fetchLeadsData(currentPage);
    } catch (err) {
      toast.error(`Failed to perform bulk action "${action}".`);
    }
  };

  const handleAssignLeads = async (userId) => await handleBulkAction('assign_user', { user_id: userId });
  const handleUpdateStatus = async (newStatus) => await handleBulkAction('update_status', { new_status: newStatus });
  const handleBulkAIScore = async () => await handleBulkAction('ai_score');
  const handleBulkEnrich = async () => await handleBulkAction('enrich');

  const handleAddLeadsFromSearch = async () => {
    if (!selectedLeads.length) {
      toast.error('No emails selected!');
      return;
    }
    try {
      const domainSearchId = leads[0]?.domain_search_id;
      if (!domainSearchId) throw new Error('Domain search ID missing.');
      const response = await addLeadsFromSearch(selectedLeads, domainSearchId);
      toast.success(response.message || 'Leads added from search.');
      fetchLeadsData(currentPage);
    } catch (err) {
      toast.error('Failed to add leads from search.');
    }
  };

  // Individual lead updates
  const handleUpdateAIScore = async (leadId) => {
    if (!leadId) return;
    try {
      await updateLeadAIScore(leadId);
      toast.success('AI score updated.');
      fetchLeadsData(currentPage);
    } catch (err) {
      toast.error('Failed to update AI score.');
    }
  };

  const handleEnrichLead = async (leadId) => {
    if (!leadId) return;
    try {
      await enrichLeadData(leadId);
      toast.success('Lead enriched.');
      fetchLeadsData(currentPage);
    } catch (err) {
      toast.error('Failed to enrich lead.');
    }
  };

  const handleSortChange = (field) => {
    setOrdering(ordering === field ? `-${field}` : field);
  };

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCurrentPage(1);
  };

  // Table column definitions
  const columns = [
    { header: 'First Name', accessor: 'first_name', sortable: true },
    { header: 'Last Name', accessor: 'last_name', sortable: true },
    { header: 'Email', accessor: 'email', sortable: true },
    { header: 'Company', accessor: 'company', sortable: true },
    { header: 'Job Title', accessor: 'job_title', sortable: true },
    { header: 'AI Score', accessor: 'ai_lead_score', sortable: true },
    { header: 'Open Rate (%)', accessor: 'email_open_rate', sortable: true },
    { header: 'Interactions', accessor: 'interaction_count', sortable: true },
    { header: 'Pain Points', accessor: 'pain_points', render: (value) => value?.join(', ') || '—' },
    { header: 'Status', accessor: 'status', sortable: true },
    { header: 'Source', accessor: 'source', sortable: true },
    { header: 'Enriched', accessor: 'hunter_data', render: (value) => value ? 'Yes' : 'No' },
    {
      header: 'Actions',
      accessor: 'id',
      render: (_, row) => {
        if (!row || !row.id) return null;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleUpdateAIScore(row.id)}
              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
            >
              Update AI
            </button>
            <button
              onClick={() => handleEnrichLead(row.id)}
              className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
            >
              Enrich
            </button>
          </div>
        );
      },
    },
  ];

  if (loading) return <div className="text-center mt-10 text-gray-200 animate-pulse">Loading leads...</div>;
  if (error) return (
    <div className="text-center mt-10 text-red-400">
      Error fetching leads. <button onClick={() => fetchLeadsData(currentPage)} className="ml-2 text-blue-500 underline">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="sticky top-0 z-50 bg-gray-900 shadow p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Leads</h1>
            <p className="text-sm text-gray-400">AI-Enhanced Lead Management</p>
          </div>
          <div className="flex gap-3">
            <Link to="/leads/add" className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
              <Plus size={16} /> Add Lead
            </Link>
            <button onClick={() => setShowBulkImport(true)} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
              <Download size={16} /> Bulk Import
            </button>
            <button onClick={() => fetchLeadsData(currentPage)} className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 pt-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads by name, email, company..."
              onChange={(e) => debouncedSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded">
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
          </select>
          <select name="source" value={filters.source} onChange={handleFilterChange} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded">
            <option value="">All Sources</option>
            <option value="website_form">Website Form</option>
            <option value="hunter_io">Hunter.io</option>
            <option value="manual_entry">Manual Entry</option>
            <option value="other">Other</option>
          </select>
          <select name="industry" value={filters.industry} onChange={handleFilterChange} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded">
            <option value="">All Industries</option>
            {industries.map(industry => <option key={industry} value={industry}>{industry}</option>)}
          </select>
          <select name="company_size" value={filters.company_size} onChange={handleFilterChange} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded">
            <option value="">All Sizes</option>
            {companySizes.map(size => <option key={size} value={size}>{size}</option>)}
          </select>
          <input
            type="number"
            name="min_ai_score"
            value={filters.min_ai_score}
            onChange={handleFilterChange}
            placeholder="Min AI Score"
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded w-32"
          />
        </div>

        {showBulkImport && (
          <div className="mb-4 bg-gray-800 p-4 rounded">
            <BulkImport onClose={() => setShowBulkImport(false)} onUpload={() => fetchLeadsData(currentPage)} />
          </div>
        )}

        {selectedLeads.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button onClick={() => handleBulkAction('delete')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
              Delete Selected
            </button>
            <AssignLeadDropdown onAssign={handleAssignLeads} />
            <button onClick={handleBulkAIScore} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">
              Update AI Scores
            </button>
            <button onClick={handleBulkEnrich} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">
              Enrich Selected
            </button>
            <button onClick={handleAddLeadsFromSearch} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
              Add from Search
            </button>
          </div>
        )}

        <div className="w-full overflow-x-auto mb-4">
          <Table
            columns={columns}
            data={leads}
            onEdit={(id) => navigate(`/leads/${id}/edit`)}
            onDelete={handleDelete}
            onSelect={setSelectedLeads}
            onSort={handleSortChange}
          />
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchLeadsData} />
      </div>
    </div>
  );
};

export default React.memo(Leads);