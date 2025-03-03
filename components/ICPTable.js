// src/components/ICPTable.js

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/solid';
import Button from './Button';

const ICPTable = ({ icps, onView, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Job Title</th>
            <th className="py-3 px-6 text-left">Industry</th>
            <th className="py-3 px-6 text-left">Company HQ Location</th>
            <th className="py-3 px-6 text-left">Contact Location</th>
            <th className="py-3 px-6 text-left">Company Size</th>
            <th className="py-3 px-6 text-left">Keywords</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
          {icps.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-3 px-6 text-center">
                No ICPs found.
              </td>
            </tr>
          ) : (
            icps.map((icp) => (
              <tr
                key={icp.id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {icp.name}
                </td>
                <td className="py-3 px-6 text-left">
                  {icp.job_title || '—'}
                </td>
                <td className="py-3 px-6 text-left">
                  {icp.industry || '—'}
                </td>
                <td className="py-3 px-6 text-left">
                  {icp.company_hq_location || '—'}
                </td>
                <td className="py-3 px-6 text-left">
                  {icp.contact_location || '—'}
                </td>
                <td className="py-3 px-6 text-left">
                  {icp.company_size || '—'}
                </td>
                <td className="py-3 px-6 text-left">
                  {icp.keywords || '—'}
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex item-center justify-center space-x-2">
                    <button
                      onClick={() => onView(icp.id)}
                      className="text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-500"
                      aria-label={`View ICP ${icp.name}`}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(icp.id)}
                      className="text-yellow-500 dark:text-yellow-300 hover:text-yellow-700 dark:hover:text-yellow-500"
                      aria-label={`Edit ICP ${icp.name}`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(icp.id)}
                      className="text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-500"
                      aria-label={`Delete ICP ${icp.name}`}
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

export default ICPTable;