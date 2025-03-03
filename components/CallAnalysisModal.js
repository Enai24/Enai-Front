/**
 * @description
 *   Displays detailed analysis data for a specific call in a modal.
 *   Dynamically renders all analysis fields, including nested objects.
 * @notes
 *   - Production-ready with robust error handling and dynamic rendering.
 *   - Matches data structure from /calls/<int:call_id>/analyze/.
 */

import React from 'react';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';

const CallAnalysisModal = ({ call, onClose }) => {
  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-5 text-gray-300">
          {value.map((item, index) => (
            <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object' && value !== null) {
      return <pre className="text-gray-300 bg-gray-900 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>;
    }
    return <span className="text-gray-300">{value || 'N/A'}</span>;
  };

  const renderAnalysisData = () => {
    if (!call?.analysis || Object.keys(call.analysis).length === 0) {
      return <div className="text-sm text-gray-300">No analysis data available.</div>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(call.analysis).map(([key, value]) => (
          <div key={key} className="mb-4">
            <strong className="text-white capitalize">{key.replace(/_/g, ' ')}:</strong>
            <div className="mt-1">{renderValue(value)}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-xl p-6 w-[1000px] max-h-[80vh] overflow-y-auto border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Call Analysis</h2>
            <p className="text-gray-400 mt-1">
              {call?.customer || 'Unknown Customer'} - {call?.timestamp ? new Date(call.timestamp).toLocaleString() : 'No Timestamp'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition" aria-label="Close">
            ✕
          </button>
        </div>
        {renderAnalysisData()}
      </div>
    </div>
  );
};

export default React.memo(CallAnalysisModal);