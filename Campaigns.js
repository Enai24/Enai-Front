// src/pages/CampaignsPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Search, Plus, Download, RefreshCw } from 'lucide-react';
import { 
  fetchCampaigns, 
  fetchCampaignAnalytics, 
  fetchCampaignRecommendations, 
  fetchTemplateAnalytics 
} from '../services/api';
import CampaignList from '../components/CampaignList';
import Button from '../components/Button';
import NewCampaignModal from '../components/NewCampaignModal';
import CampaignPerformanceChart from '../components/CampaignPerformanceChart';
import { toast } from 'react-toastify';
import api from '../services/api';
import debounce from 'lodash/debounce';
import sanitizeHtml from 'sanitize-html';
import useWebSocket from '../utils/useWebSocket';

// Status options (since backend doesn’t provide dynamically)
const STATUS_OPTIONS = ['all', 'draft', 'active', 'paused', 'completed'];
const DATE_RANGE_OPTIONS = ['7d', '30d', '90d'];
const SORT_OPTIONS = ['desc', 'asc'];

// Simple ErrorBoundary for catching rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-center text-red-500 p-6">Something went wrong. <button onClick={() => window.location.reload()} className="underline">Retry</button></div>;
    }
    return this.props.children;
  }
}

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAnalytics, setShowAnalytics] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignAnalyticsData, setCampaignAnalyticsData] = useState({});
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [templatePerformanceData, setTemplatePerformanceData] = useState({});

  // Fetch with retry logic
  const fetchWithRetry = useCallback(async (apiFunc, params = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await apiFunc(params);
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }, []);

  // Load campaigns
  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: sanitizeHtml(searchTerm) || undefined,
        ordering: sortOrder === 'desc' ? '-created_at' : 'created_at',
      };
      const data = await fetchWithRetry(fetchCampaigns, params);
      const mappedCampaigns = data.results.map(campaign => ({
        id: campaign.id.toString(),
        name: campaign.name,
        emailsSent: campaign.emails_sent || 0,
        openRate: campaign.open_rate || 0,
        responseRate: campaign.response_rate || 0,
        meetings: campaign.meetings || 0,
        status: campaign.status,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        targetAudience: campaign.icp?.target_audience || 'N/A',
        description: campaign.description || 'No description provided.',
        dailyLimit: campaign.daily_limit || 0,
        template: campaign.template || 'No template provided.',
      }));
      setCampaigns(mappedCampaigns);
    } catch (err) {
      setError(true);
      toast.error('Error loading campaigns.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, sortOrder, fetchWithRetry]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  // Debounce search input
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 500),
    []
  );
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  
  // Use custom WebSocket hook to update campaigns in real time
   const wsStatus = useWebSocket('/ws/campaigns/', () => {
    loadCampaigns();
  });
  console.log("WebSocket status (Campaigns):", wsStatus);

  // Fetch campaign details
  const fetchAnalyticsData = useCallback(async (campaignId) => {
    try {
      const analytics = await fetchWithRetry(() => fetchCampaignAnalytics(campaignId, dateRange));
      setCampaignAnalyticsData(prev => ({ ...prev, [campaignId]: analytics }));
    } catch (err) {
      toast.error('Error loading campaign analytics.');
    }
  }, [dateRange]);

  const fetchAIRecommendations = useCallback(async (campaignId) => {
    try {
      const recommendations = await fetchWithRetry(() => fetchCampaignRecommendations(campaignId));
      setAiRecommendations(prev => ({ ...prev, [campaignId]: recommendations }));
    } catch (err) {
      toast.error('Error loading AI recommendations.');
    }
  }, []);

  const fetchTemplateAnalyticsData = useCallback(async (campaignId) => {
    try {
      const templateAnalytics = await fetchWithRetry(() => fetchTemplateAnalytics(campaignId, dateRange));
      setTemplatePerformanceData(prev => ({ ...prev, [campaignId]: templateAnalytics }));
    } catch (err) {
      toast.error('Error loading template performance data.');
    }
  }, [dateRange]);

  // Delete campaign (assuming DELETE endpoint exists)
  const handleDelete = useCallback(async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.delete(`/campaigns/${campaignId}/`);
      setCampaigns(prev => prev.filter(c => c.id !== campaignId));
      toast.success('Campaign deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete campaign.');
    }
  }, []);

  const toggleAnalytics = async (campaignId) => {
    setShowAnalytics(prev => ({ ...prev, [campaignId]: !prev[campaignId] }));
    if (!showAnalytics[campaignId]) {
      await Promise.all([
        fetchAnalyticsData(campaignId),
        fetchAIRecommendations(campaignId),
        fetchTemplateAnalyticsData(campaignId),
      ]);
    }
  };

  const handleExport = useCallback(() => {
    const csvContent = [
      ['ID', 'Name', 'Status', 'Emails Sent', 'Open Rate', 'Response Rate', 'Meetings', 'Start Date', 'End Date', 'Daily Limit', 'Target Audience', 'Description', 'Template'],
      ...campaigns.map(c => [
        c.id, c.name, c.status, c.emailsSent, c.openRate, c.responseRate, c.meetings, c.startDate, c.endDate, c.dailyLimit, c.targetAudience, c.description, c.template,
      ]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaigns.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Campaigns exported as CSV.');
  }, [campaigns]);

  const handleAddCampaign = useCallback((newCampaign) => {
    setCampaigns(prev => [newCampaign, ...prev]);
    toast.success('Campaign created successfully!');
  }, []);

  const overallAnalytics = campaigns.length > 0 && campaignAnalyticsData[campaigns[0].id] ? campaignAnalyticsData[campaigns[0].id] : null;

  const filteredCampaigns = useMemo(() => {
    return campaigns
      .filter(campaign => {
        const matchesSearch = 
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          campaign.targetAudience.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => sortOrder === 'desc' ? new Date(b.startDate) - new Date(a.startDate) : new Date(a.startDate) - new Date(b.startDate));
  }, [campaigns, searchTerm, statusFilter, sortOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-gray-400 animate-pulse">
        Loading campaigns...
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-red-500">
        Error fetching campaigns. <button onClick={loadCampaigns} className="ml-2 text-blue-500 underline" aria-label="Retry fetching campaigns">Retry</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Campaigns</h1>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExport} variant="secondary" aria-label="Export Report">
                <Download className="h-4 w-4 mr-2" /> Export Report
              </Button>
              <Button onClick={() => setIsModalOpen(true)} variant="primary" aria-label="New Campaign">
                <Plus className="h-4 w-4 mr-2" /> New Campaign
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search campaigns"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-indigo-500"
              aria-label="Filter by campaign status"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt === 'all' ? 'All Status' : opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-indigo-500"
              aria-label="Select date range"
            >
              {DATE_RANGE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>Last {opt.replace('d', ' days')}</option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:ring-2 focus:ring-indigo-500"
              aria-label="Sort campaigns by start date"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt === 'desc' ? 'Newest First' : 'Oldest First'}</option>
              ))}
            </select>
            <Button onClick={loadCampaigns} variant="secondary" aria-label="Refresh campaigns">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          </div>

          {overallAnalytics && (
            <div className="bg-gray-800 rounded-xl shadow-sm mb-8 p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                <h2 className="text-lg font-semibold text-gray-100">Campaign Analytics</h2>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-indigo-500"
                    aria-label="Select date range for overall analytics"
                  >
                    {DATE_RANGE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>Last {opt.replace('d', ' days')}</option>
                    ))}
                  </select>
                  <Button onClick={loadCampaigns} variant="secondary" aria-label="Refresh overall analytics">
                    <RefreshCw className="h-4 w-4" /> Refresh
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Total Emails</span>
                    <span className="text-xs text-green-500">{overallAnalytics.emailsChange ? `+${overallAnalytics.emailsChange}%` : ''}</span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-100 mt-2">{overallAnalytics.total_emails_sent.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Open Rate</span>
                    <span className="text-xs text-green-500">{overallAnalytics.openRateChange ? `+${overallAnalytics.openRateChange}%` : ''}</span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-100 mt-2">{overallAnalytics.open_rate}%</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Response Rate</span>
                    <span className="text-xs text-green-500">{overallAnalytics.responseRateChange ? `+${overallAnalytics.responseRateChange}%` : ''}</span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-100 mt-2">{overallAnalytics.response_rate}%</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Meetings</span>
                    <span className="text-xs text-green-500">{overallAnalytics.meetingsChange ? `+${overallAnalytics.meetingsChange}%` : ''}</span>
                  </div>
                  <p className="text-2xl font-semibold text-gray-100 mt-2">{overallAnalytics.meetings_booked}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-800 rounded-xl shadow-sm mb-8 p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <h3 className="text-sm font-medium text-gray-100">Daily Performance</h3>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-indigo-500"></div><span className="text-sm text-gray-400">Emails</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-green-500"></div><span className="text-sm text-gray-400">Opens</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-yellow-500"></div><span className="text-sm text-gray-400">Responses</span></div>
              </div>
            </div>
            <div className="h-64 relative">
              <CampaignPerformanceChart performanceData={overallAnalytics?.daily_performance || []} />
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 gap-6 p-6">
              <CampaignList
                campaigns={filteredCampaigns}
                toggleAnalytics={toggleAnalytics}
                showAnalytics={showAnalytics}
                analyticsData={campaignAnalyticsData}
                aiRecommendations={aiRecommendations}
                templatePerformanceData={templatePerformanceData}
                onDelete={handleDelete}
              />
            </div>
          </div>

          <NewCampaignModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onAdd={handleAddCampaign} 
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CampaignsPage;