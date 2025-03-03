/**
 * @description
 *   The CallsPage component manages the B2B outbound sales calls interface.
 *   It includes filtering, sorting, real-time updates via WebSocket, call analysis,
 *   AI script generation, and in-app audio playback.
 *
 *   Sub-components:
 *     - CallsFilters: Filters calls by agent, status, and date range.
 *     - CallTable: Displays calls with sorting and actions.
 *     - CallAnalysisModal: Shows dynamic call analysis.
 *     - AIScriptModal: Generates AI call scripts.
 *     - AudioPlayer: Plays call audio in-app (stubbed).
 *
 *   Aggregates metrics for top cards (quality, sentiment, risk flags).
 *
 * @notes
 *   - Uses existing APIs from ../services/api without changes.
 *   - WebSocket replaces polling for real-time updates.
 *   - Includes error handling, accessibility, and performance optimizations.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus,
  BarChart,
  BookOpen,
  FileText,
  Search,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  fetchCalls,
  deleteCall,
  analyzeCall,
  generateCallScript,
} from '../services/api';
import CallsFilters from '../components/CallsFilters';
import CallTable from '../components/CallTable';
import CallAnalysisModal from '../components/CallAnalysisModal';
import AudioPlayer from '../components/AudioPlayer';
import api from '../services/api';
import debounce from 'lodash/debounce';
import sanitizeHtml from 'sanitize-html';
import useWebSocket from '../utils/useWebSocket'; // Importing the WebSocket hook

// Filter options (mocked since backend doesn’t provide dynamically)
const STATUS_OPTIONS = ['', 'scheduled', 'completed', 'missed'];
const AGENT_OPTIONS = ['', 'Agent A', 'Agent B', 'Agent C']; // Mock agents

// AI Script Modal (kept inline for simplicity)
const AIScriptModal = React.memo(({ onClose, scriptPrompt, setScriptPrompt, generatedScript, setGeneratedScript, handleGenerateScript }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
    <div className="bg-gray-800 rounded-xl p-6 w-[600px] max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Generate AI Script</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close AI Script Modal">
          ✕
        </button>
      </div>
      <div className="mb-4">
        <label htmlFor="scriptPrompt" className="block text-sm font-medium text-white">Custom Prompt</label>
        <textarea
          id="scriptPrompt"
          value={scriptPrompt}
          onChange={(e) => setScriptPrompt(e.target.value)}
          placeholder="Enter a custom prompt for the AI script..."
          className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-white focus:outline-none focus:ring-blue-500"
          rows="4"
          aria-label="Custom prompt for AI script"
        />
      </div>
      <div className="mb-4">
        <button
          onClick={handleGenerateScript}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition-colors"
          aria-label="Generate AI Script"
        >
          Generate Script
        </button>
      </div>
      {generatedScript && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Generated Script</h3>
          <textarea
            value={generatedScript}
            onChange={(e) => setGeneratedScript(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-white focus:outline-none focus:ring-blue-500"
            rows="6"
            aria-label="Generated AI script"
          />
        </div>
      )}
    </div>
  </div>
));

const CallsPage = () => {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedCall, setSelectedCall] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [scriptPrompt, setScriptPrompt] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const navigate = useNavigate();

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

  // Fetch calls data
  const fetchCallsData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(false);
    try {
      const params = {
        page,
        search: sanitizeHtml(searchQuery),
        ordering: sortColumn ? `${sortDirection === 'asc' ? '' : '-'}${sortColumn}` : '-created_at',
        _timestamp: Date.now(),
        agent: selectedAgent || undefined,
        status: selectedStatus || undefined,
        start_date: dateRange.start ? dateRange.start.toISOString() : undefined,
        end_date: dateRange.end ? dateRange.end.toISOString() : undefined,
      };
      const data = await fetchWithRetry(fetchCalls, params);
      setCalls(data.results || []);
      setCurrentPage(page);
      setTotalPages(Math.ceil(data.count / 25));
    } catch (err) {
      setError(true);
      toast.error('Failed to fetch calls after retries.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedAgent, selectedStatus, dateRange, sortColumn, sortDirection]);

  // WebSocket handler for real-time updates
  const handleWsMessage = useCallback((data) => {
    console.log('WebSocket message received:', data);
    fetchCallsData(currentPage); // Refresh calls on any update
  }, [currentPage, fetchCallsData]);

  // Integrate WebSocket using the useWebSocket hook
  const wsStatus = useWebSocket('/ws/calls/', handleWsMessage);

  // Initial fetch and WebSocket status logging
  useEffect(() => {
    fetchCallsData(currentPage);
    console.log('WebSocket status:', wsStatus);
  }, [fetchCallsData, currentPage, wsStatus]);

  // Sort handler
  const handleSort = useCallback((column) => {
    setSortColumn(prev => prev === column ? column : column);
    setSortDirection(prev => prev === column ? (sortDirection === 'asc' ? 'desc' : 'asc') : 'asc');
    fetchCallsData(currentPage);
  }, [sortColumn, sortDirection, currentPage]);

  // Action handlers
  const handleAnalyze = useCallback(async (call) => {
    try {
      const goal = "Analyze call performance";
      const questions = [
        ["How effective was the call?", "string"],
        ["Did the customer express any concerns?", "boolean"],
      ];
      const analysisData = await fetchWithRetry(() => analyzeCall(call.id, goal, questions));
      setSelectedCall({ ...call, analysis: analysisData });
      setShowAnalysis(true);
    } catch (err) {
      toast.error('Failed to analyze call.');
    }
  }, []);

  const handleView = useCallback((id) => navigate(`/dashboard/calls/${id}/`), [navigate]);

  const handleDownload = useCallback((audioUrl) => {
    if (audioUrl) window.open(audioUrl, '_blank');
    else toast.info('No audio recording available.');
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm("Are you sure you want to delete this call?")) return;
    try {
      await fetchWithRetry(() => deleteCall(id));
      toast.success('Call deleted successfully.');
      fetchCallsData(currentPage);
    } catch (err) {
      toast.error('Failed to delete call.');
    }
  }, [currentPage]);

  const handleGenerateScript = useCallback(async () => {
    if (!scriptPrompt.trim()) {
      toast.error("Please enter a valid prompt for script generation.");
      return;
    }
    try {
      const response = await fetchWithRetry(() => generateCallScript(sanitizeHtml(scriptPrompt)));
      if (response.error) {
        toast.error(`Script generation failed: ${response.error}`);
      } else {
        setGeneratedScript(response.script);
        toast.success("Script generated successfully!");
      }
    } catch (err) {
      toast.error("Failed to generate script.");
    }
  }, [scriptPrompt]);

  // Aggregate metrics
  const aggregateMetrics = useMemo(() => {
    let totalQuality = 0, totalSentiment = 0, count = 0, riskFlags = 0;
    calls.forEach((call) => {
      if (call.analysis) {
        if (typeof call.analysis.qualityScore === 'number') totalQuality += call.analysis.qualityScore;
        if (call.analysis.sentiment && typeof call.analysis.sentiment.positive === 'number') totalSentiment += call.analysis.sentiment.positive;
        if (Array.isArray(call.analysis.riskFlags)) riskFlags += call.analysis.riskFlags.length;
        count++;
      }
    });
    return {
      qualityScore: count ? (totalQuality / count).toFixed(1) : "N/A",
      positiveSentiment: count ? (totalSentiment / count).toFixed(1) : "N/A",
      riskFlagsCount: count ? riskFlags : "N/A",
    };
  }, [calls]);

  const { qualityScore, positiveSentiment, riskFlagsCount } = aggregateMetrics;

  if (loading) {
    return <div className="text-center mt-10 text-white animate-pulse">Loading calls...</div>;
  }
  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error fetching calls. <button onClick={() => fetchCallsData(currentPage)} className="ml-2 text-blue-500 underline" aria-label="Retry fetching calls">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-900 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Calls</h1>
          <p className="text-gray-400 mt-2">AI-powered insights from your calls</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/dashboard/calls/add')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            aria-label="Add new call"
          >
            <Plus className="w-5 h-5" />
            <span>New Call</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/calls/analytics')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            aria-label="View analytics"
          >
            <BarChart className="w-5 h-5" />
            <span>Analytics</span>
          </button>
          <button
            onClick={() => navigate('/dashboard/knowledge')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            aria-label="Knowledge Base"
          >
            <BookOpen className="w-5 h-5" />
            <span>Knowledge Base</span>
          </button>
          <button
            onClick={() => setShowScriptModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            aria-label="Generate AI Script"
          >
            <FileText className="w-5 h-5" />
            <span>Generate Script</span>
          </button>
        </div>
      </div>

      <CallsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Call Quality</h3>
            <span className="text-green-400">↑ 12%</span>
          </div>
          <div className="text-3xl font-bold">{qualityScore !== "N/A" ? `${qualityScore}%` : "N/A"}</div>
          <p className="text-gray-400 text-sm mt-2">Average score</p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sentiment</h3>
            <span className="text-green-400">↑ 8%</span>
          </div>
          <div className="text-3xl font-bold">{positiveSentiment !== "N/A" ? `${positiveSentiment}%` : "N/A"}</div>
          <p className="text-gray-400 text-sm mt-2">Positive interactions</p>
        </div>
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Risk Flags</h3>
            <span className="text-yellow-400">↓ 5%</span>
          </div>
          <div className="text-3xl font-bold">{riskFlagsCount !== "N/A" ? riskFlagsCount : "N/A"}</div>
          <p className="text-gray-400 text-sm mt-2">Items requiring attention</p>
        </div>
      </div>

      <CallTable
        calls={calls}
        onView={handleView}
        onAnalyze={handleAnalyze}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          Previous
        </button>
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">Page</span>
          <span className="px-3 py-1 bg-gray-700 rounded-lg">{currentPage}</span>
          <span className="text-gray-400">of {totalPages}</span>
        </div>
        <button
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next
        </button>
      </div>

      {showAnalysis && selectedCall && selectedCall.analysis && (
        <CallAnalysisModal call={selectedCall} onClose={() => setShowAnalysis(false)} />
      )}

      {showScriptModal && (
        <AIScriptModal
          onClose={() => setShowScriptModal(false)}
          scriptPrompt={scriptPrompt}
          setScriptPrompt={setScriptPrompt}
          generatedScript={generatedScript}
          setGeneratedScript={setGeneratedScript}
          handleGenerateScript={handleGenerateScript}
        />
      )}
    </div>
  );
};

export default React.memo(CallsPage);