/**
 * @description
 *   Displays detailed analysis for a specific call, including emotions from Bland.ai.
 *   Production-ready with error handling and dynamic rendering.
 * @notes
 *   - Uses /calls/<int:call_id>/emotions/ for emotion analysis.
 *   - Assumes analysis prop contains data from /calls/<int:call_id>/analyze/.
 */

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaBookOpen, FaRegCommentDots } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CallAnalysis = ({ call, analysis }) => {
  const [emotionData, setEmotionData] = useState(null);
  const [loadingEmotion, setLoadingEmotion] = useState(false);
  const [emotionError, setEmotionError] = useState(null);

  useEffect(() => {
    if (call && call.bland_ai_call_id) {
      setLoadingEmotion(true);
      api.post(`/calls/${call.bland_ai_call_id}/emotions/`)
        .then(({ data }) => {
          setEmotionData(data);
          setLoadingEmotion(false);
        })
        .catch(err => {
          setEmotionError(err.response?.data?.error || 'Error analyzing emotions');
          setLoadingEmotion(false);
        });
    }
  }, [call]);

  if (!call) {
    return <p className="text-center mt-10 text-gray-400">Loading call details...</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-white">📞 Call Analysis</h2>
        <p className="text-gray-400">
          {call.customer || 'Unknown'} - {call.created_at ? new Date(call.created_at).toLocaleString() : 'No Date'}
        </p>

        <div className="mt-6 bg-gray-700 p-4 rounded-md">
          <h3 className="text-lg font-semibold text-white">Emotional Analysis</h3>
          {loadingEmotion ? (
            <p className="text-gray-300">Analyzing emotions...</p>
          ) : emotionError ? (
            <p className="text-red-400">{emotionError}</p>
          ) : emotionData ? (
            <div className="text-gray-300">
              <p><strong>Dominant Emotion:</strong> {emotionData.emotion || 'N/A'}</p>
              {emotionData.confidence && <p><strong>Confidence:</strong> {(emotionData.confidence * 100).toFixed(1)}%</p>}
            </div>
          ) : (
            <p className="text-gray-300">No emotion data available.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaBookOpen className="mr-2 text-blue-400" /> Topics
            </h3>
            <ul className="text-gray-300 space-y-1">
              {(analysis?.topics || []).map((topic, index) => <li key={index}>• {topic}</li>) || <li>No topics available</li>}
            </ul>
          </div>

          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaRegCommentDots className="mr-2 text-green-400" /> Key Insights
            </h3>
            <ul className="text-gray-300 space-y-1">
              {(analysis?.keyInsights || []).map((insight, index) => <li key={index}>• {insight}</li>) || <li>No key insights available</li>}
            </ul>
          </div>

          <div className="bg-gray-700 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaExclamationTriangle className="mr-2 text-red-400" /> Risk Flags
            </h3>
            <ul className="text-gray-300 space-y-1">
              {(analysis?.riskFlags || []).map((flag, index) => <li key={index}>• {flag}</li>) || <li>No risk flags detected</li>}
            </ul>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mt-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FaRegCommentDots className="mr-2 text-blue-400" /> Transcript
          </h3>
          {analysis?.transcript && analysis.transcript.length > 0 ? (
            <div className="space-y-3">
              {analysis.transcript.map((entry, index) => (
                <p key={index} className="text-gray-300">
                  <span className="font-bold text-white">
                    {entry.timestamp || 'N/A'} - {entry.speaker || 'Unknown'}:
                  </span>{' '}
                  {entry.text || 'No text'}
                  <span className={`ml-2 ${entry.sentiment === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                    {entry.sentiment || 'N/A'}
                  </span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No transcript available.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaCheckCircle className="mr-2 text-yellow-400" /> Action Items
            </h3>
            <ul className="text-gray-300 space-y-1">
              {(analysis?.actionItems || []).map((item, index) => <li key={index}>• {item}</li>) || <li>No action items recorded</li>}
            </ul>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg flex flex-col justify-between">
            <h3 className="text-lg font-semibold mb-2">⭐ Quality Score</h3>
            <p className="text-3xl font-bold text-green-400">
              {analysis?.qualityScore ? `${analysis.qualityScore}%` : 'N/A'}
            </p>
            <div className="flex items-center mt-4">
              <span
                className={`px-3 py-1 rounded-md ${analysis?.qualityScore > 80 ? 'bg-green-600' : 'bg-yellow-600'} text-white`}
              >
                {analysis?.qualityScore > 80 ? 'Good Call' : 'Needs Work'}
              </span>
              <Link to={`/calls/${call.id}/report`} className="ml-3 text-blue-400 hover:text-blue-300 flex items-center">
                📄 Full Report
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <Link to="/calls">
            <button className="bg-gray-600 hover:bg-gray-500 text-white px-5 py-2 rounded-md transition">
              🔙 Back to Calls
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CallAnalysis);