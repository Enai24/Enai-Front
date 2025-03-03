/**
 * @description
 *   The CallsTable component renders a table displaying call data.
 *   It supports sorting via clickable headers and provides action buttons for each call.
 * @notes
 *   - Expects props for calls array, action handlers, and sorting state.
 *   - The "CUSTOMER" column links to a contact detail page.
 */

import React from 'react';
import { Eye, Mic, Download, Trash2 } from 'lucide-react';

const CallsTable = ({ calls, onView, onAnalyze, onDownload, onDelete, onSort, sortColumn, sortDirection }) => {
  const renderSortIcon = (column) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer" onClick={() => onSort('phone_number')}>
              NUMBER {renderSortIcon('phone_number')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer" onClick={() => onSort('customer')}>
              CUSTOMER {renderSortIcon('customer')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer" onClick={() => onSort('duration')}>
              DURATION {renderSortIcon('duration')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer" onClick={() => onSort('status')}>
              STATUS {renderSortIcon('status')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">TAGS</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer" onClick={() => onSort('timestamp')}>
              TIMESTAMP {renderSortIcon('timestamp')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {calls.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-4">No calls found.</td>
            </tr>
          ) : (
            calls.map((call) => (
              <tr key={call.id} className="hover:bg-gray-750 transition-colors cursor-pointer">
                <td className="px-6 py-4 text-sm text-gray-300">{call.phone_number || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-300">
                  {call.customer ? (
                    <a href={`/dashboard/contacts/${call.contact_id}`} className="text-blue-400 hover:underline">
                      {call.customer}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{call.duration || '—'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      call.status === 'Completed'
                        ? 'bg-green-500/20 text-green-400'
                        : call.status === 'In Progress'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {call.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {call.tags && call.tags.length > 0 ? (
                      call.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-700 rounded-lg text-xs text-gray-300">
                          {tag}
                          {/* "x" button for tag removal can be implemented here */}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-300">{call.timestamp || '—'}</td>
                <td className="px-6 py-4">
                  <div className="flex space-x-1">
                    <button onClick={() => onView(call.id)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onAnalyze(call)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer">
                      <Mic className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDownload(call.audio_url)} className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(call.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CallsTable;