// src/components/ReportTable.js

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/solid';
import Button from './Button';

const ReportTable = ({ reports, onView, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Title</th>
            <th className="py-3 px-6 text-left">Description</th>
            <th className="py-3 px-6 text-left">Created At</th>
            <th className="py-3 px-6 text-left">Updated At</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
          {reports.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-3 px-6 text-center">
                No reports found.
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr
                key={report.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {report.title}
                </td>
                <td className="py-3 px-6 text-left">
                  {report.description.length > 50
                    ? `${report.description.substring(0, 50)}...`
                    : report.description}
                </td>
                <td className="py-3 px-6 text-left">
                  {new Date(report.created_at).toLocaleString()}
                </td>
                <td className="py-3 px-6 text-left">
                  {new Date(report.updated_at).toLocaleString()}
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center space-x-2">
                    <button
                      onClick={() => onView(report.id)}
                      className="text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-500"
                      aria-label={`View Report ${report.title}`}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(report.id)}
                      className="text-yellow-500 dark:text-yellow-300 hover:text-yellow-700 dark:hover:text-yellow-500"
                      aria-label={`Edit Report ${report.title}`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(report.id)}
                      className="text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-500"
                      aria-label={`Delete Report ${report.title}`}
                    >
                      <TrashIcon className="h-5 w-5" />
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

export default ReportTable;