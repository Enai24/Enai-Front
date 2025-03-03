/**
 * @description
 *   Displays detailed call information in a table format with actions.
 *   Production-ready with robust null checks and consistent styling.
 * @notes
 *   - Does not make direct API calls; relies on parent component data.
 *   - Ensures no stray calls to /api/calls/analytics/.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const CallView = ({ call, onAnalyze }) => {
  if (!call) {
    return <p className="text-center mt-10 text-gray-400">Loading call details...</p>;
  }

  return (
    <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
        📞 Call Details
      </h2>

      <table className="w-full table-auto border-collapse border border-gray-700">
        <tbody>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">📞 Phone Number</th>
            <td className="px-4 py-2">{call?.phone_number || 'N/A'}</td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">🔹 Status</th>
            <td className="px-4 py-2">
              <span
                className={`px-3 py-1 rounded ${
                  call?.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : call?.status === 'queued' || call?.status === 'scheduled'
                    ? 'bg-yellow-500 text-black'
                    : 'bg-red-600 text-white'
                }`}
              >
                {call?.status ? call.status.charAt(0).toUpperCase() + call.status.slice(1) : 'N/A'}
              </span>
            </td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">🆔 Call ID</th>
            <td className="px-4 py-2">{call?.bland_ai_call_id || '—'}</td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">🎯 Task</th>
            <td className="px-4 py-2">{call?.task || '—'}</td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">🕒 Start Time</th>
            <td className="px-4 py-2">
              {call?.start_time ? new Date(call.start_time).toLocaleString() : '—'}
            </td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">🎤 Voice</th>
            <td className="px-4 py-2">{call?.voice || '—'}</td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">🌍 Language</th>
            <td className="px-4 py-2">{call?.language || '—'}</td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">⏳ Timezone</th>
            <td className="px-4 py-2">{call?.timezone || '—'}</td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">🔊 Audio Recording</th>
            <td className="px-4 py-2">
              {call?.audio_url ? (
                <audio controls className="w-full mt-2">
                  <source src={call.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <span className="text-red-400">No audio recording available.</span>
              )}
            </td>
          </tr>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-2 text-left text-gray-400">📝 Transcript</th>
            <td className="px-4 py-2 whitespace-pre-wrap">
              {call?.transcript || <span className="text-gray-500">No transcript available.</span>}
            </td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left text-gray-400">📊 Analysis</th>
            <td className="px-4 py-2">
              {call?.analysis ? (
                <pre className="bg-gray-800 p-2 rounded overflow-x-auto text-gray-200">
                  {JSON.stringify(call.analysis, null, 2)}
                </pre>
              ) : (
                <span className="text-yellow-400">Pending Analysis</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={`/dashboard/calls/${call?.id}/edit/`}>
          <Button variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
            ✏ Edit Call
          </Button>
        </Link>
        <Button
          variant="warning"
          className="bg-yellow-600 text-white hover:bg-yellow-500"
          onClick={onAnalyze}
        >
          🧪 Analyze Call
        </Button>
        <Link to="/dashboard/calls/">
          <Button variant="secondary" className="bg-gray-700 text-white hover:bg-gray-600">
            🔙 Back to Calls
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default React.memo(CallView);