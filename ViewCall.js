/**
 * @description
 *   Displays details of a specific call with real-time updates via WebSocket.
 *   Allows triggering analysis and ensures production readiness.
 * @notes
 *   - Uses /calls/<int:call_id>/ for fetching call data.
 *   - Triggers analysis via /calls/<int:call_id>/analyze/.
 *   - Includes WebSocket for real-time updates and robust error handling.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import useWebSocket from '../utils/useWebSocket';
import CallView from '../components/CallView';
import SendAnalysisModal from '../components/SendAnalysisModal';
import { toast } from 'react-toastify';

const ViewCall = () => {
  const { callId } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Fetch call data with retry logic
  const fetchCall = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/calls/${callId}/`);
      setCall(data);
    } catch (err) {
      console.error('Error fetching call:', err);
      const errorMsg = err.response?.status === 404 ? 'Call not found.' : 'Failed to fetch call details.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [callId]);

  // WebSocket handler for real-time updates
  const handleWsMessage = useCallback((data) => {
    console.log('WebSocket update for call:', data);
    fetchCall(); // Refresh call data on WebSocket message
  }, [fetchCall]);

  const wsStatus = useWebSocket('/ws/calls/', handleWsMessage);

  // Initial fetch and WebSocket monitoring
  useEffect(() => {
    fetchCall();
    console.log('WebSocket status:', wsStatus);
  }, [fetchCall, wsStatus]);

  const handleAnalyze = () => {
    setIsAnalysisModalOpen(true);
  };

  const handleConfirmAnalyze = async (id) => {
    try {
      const payload = {
        goal: "Analyze call performance",
        questions: [
          ["How effective was the call?", "string"],
          ["Did the customer express any concerns?", "boolean"],
        ],
      };
      await api.post(`/calls/${id}/analyze/`, payload);
      toast.success('Call analysis started successfully.');
      setIsAnalysisModalOpen(false);
      fetchCall(); // Refresh after analysis
    } catch (err) {
      console.error('Error analyzing call:', err);
      toast.error('Failed to start call analysis.');
    }
  };

  if (loading) {
    return <div className="text-center mt-10 text-gray-400 animate-pulse">Loading call details...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-400">
        {error} <button onClick={fetchCall} className="ml-2 text-blue-500 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 p-6">
      <div className="container mx-auto bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
        <header className="flex justify-between items-center p-6 bg-gray-700/50 border-b border-gray-600">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Call Details (WebSocket: {wsStatus})
          </h1>
          <button onClick={() => navigate('/dashboard/calls')} className="text-gray-400 hover:text-white transition">
            Back to Calls
          </button>
        </header>
        <CallView call={call} onAnalyze={handleAnalyze} />
        {isAnalysisModalOpen && (
          <SendAnalysisModal
            isOpen={isAnalysisModalOpen}
            closeModal={() => setIsAnalysisModalOpen(false)}
            onConfirm={() => handleConfirmAnalyze(call.id)}
            call={call}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ViewCall);