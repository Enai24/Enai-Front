// src/components/CallView.js

import React from 'react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const CallView = ({ call, onAnalyze }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Call Details</h2>
      <table className="min-w-full table-auto">
        <tbody>
          <tr>
            <th className="px-4 py-2 text-left">Phone Number</th>
            <td className="px-4 py-2">{call.phone_number}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Status</th>
            <td className="px-4 py-2">
              {call.status.charAt(0).toUpperCase() + call.status.slice(1)}
            </td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Call ID</th>
            <td className="px-4 py-2">{call.bland_ai_call_id || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Task</th>
            <td className="px-4 py-2">{call.task || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Start Time</th>
            <td className="px-4 py-2">
              {call.start_time ? new Date(call.start_time).toLocaleString() : '—'}
            </td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Voice</th>
            <td className="px-4 py-2">{call.voice || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Language</th>
            <td className="px-4 py-2">{call.language || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Timezone</th>
            <td className="px-4 py-2">{call.timezone || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Audio Recording</th>
            <td className="px-4 py-2">
              {call.audio_url ? (
                <audio controls>
                  <source src={call.audio_url} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                'No audio recording available.'
              )}
            </td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Transcript</th>
            <td className="px-4 py-2 whitespace-pre-wrap">
              {call.transcript || 'No transcript available.'}
            </td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Analysis</th>
            <td className="px-4 py-2">
              {call.analysis ? (
                <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  {JSON.stringify(call.analysis, null, 2)}
                </pre>
              ) : (
                <span className="text-yellow-500 dark:text-yellow-300">Pending Analysis</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex space-x-2">
        <Link to={`/dashboard/calls/${call.id}/edit/`}>
          <Button variant="secondary">Edit Call</Button>
        </Link>
        <Button variant="warning" onClick={() => onAnalyze(call.id)}>
          Analyze Call
        </Button>
        <Link to="/dashboard/calls/">
          <Button variant="secondary">Back to Calls</Button>
        </Link>
      </div>
    </div>
  );
};

export default CallView;