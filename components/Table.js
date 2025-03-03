// src/components/Table.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const Table = ({ columns, data, onEdit, onDelete, onSelect, onSort }) => {
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const toggleSelect = (id) => {
    const updated = selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id];
    setSelected(updated);
    onSelect && onSelect(updated);
  };

  const selectAll = () => {
    const allIds = data.map(lead => lead.id);
    const newSelected = selected.length === data.length && data.length > 0 ? [] : allIds;
    setSelected(newSelected);
    onSelect && onSelect(newSelected);
  };

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-600">
        <thead className="bg-gray-700 text-white uppercase text-sm">
          <tr>
            <th className="py-3 px-4 text-left">
              <input
                type="checkbox"
                checked={selected.length === data.length && data.length > 0}
                onChange={selectAll}
                className="h-4 w-4 accent-blue-500 cursor-pointer"
              />
            </th>
            {columns.map(col => (
              <th
                key={col.accessor}
                onClick={() => col.sortable && onSort && onSort(col.accessor)}
                className={`py-3 px-4 text-left cursor-pointer min-w-[140px] ${col.sortable ? 'hover:bg-gray-600 transition' : ''}`}
              >
                <div className="flex items-center justify-between">
                  {col.header}
                  {col.sortable && <span className="ml-1 text-gray-300">▲</span>}
                </div>
              </th>
            ))}
            <th className="py-3 px-4 text-center min-w-[120px]">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 2} className="py-4 px-6 text-center text-gray-400">No records found.</td>
            </tr>
          ) : (
            data.map(row => (
              <tr
                key={row.id}
                className={`transition-colors duration-200 ${selected.includes(row.id) ? 'bg-gray-900' : 'hover:bg-gray-700'} cursor-pointer`}
                onClick={() => navigate(`/leads/${row.id}`)}
              >
                <td className="py-4 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={selected.includes(row.id)}
                    onChange={e => { e.stopPropagation(); toggleSelect(row.id); }}
                    className="h-4 w-4 accent-blue-500 cursor-pointer"
                  />
                </td>
                {columns.map(col => {
                  const value = row[col.accessor];
                  const cellValue = col.render ? col.render(value) : (value || '—');
                  if (col.accessor === 'ai_lead_score') {
                    const score = parseFloat(value) || 0;
                    const badgeColor = score >= 80 ? 'bg-red-600' : score >= 50 ? 'bg-yellow-600' : 'bg-green-600';
                    return (
                      <td key={col.accessor} className="py-4 px-4 text-left text-gray-300 min-w-[140px]">
                        <span className={`px-2 py-1 rounded ${badgeColor} text-white text-xs`}>
                          {score >= 80 ? 'Hot' : score >= 50 ? 'Warm' : 'Cold'} ({score.toFixed(1)})
                        </span>
                      </td>
                    );
                  }
                  return (
                    <td key={col.accessor} className="py-4 px-4 text-left text-gray-300 min-w-[140px]">
                      {cellValue}
                    </td>
                  );
                })}
                <td className="py-4 px-4 flex justify-center space-x-2">
                  <button
                    onClick={e => { e.stopPropagation(); onEdit(row.id); }}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(row.id); }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md transition"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    header: PropTypes.string.isRequired,
    accessor: PropTypes.string.isRequired,
    sortable: PropTypes.bool,
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSelect: PropTypes.func,
  onSort: PropTypes.func,
};

export default React.memo(Table);