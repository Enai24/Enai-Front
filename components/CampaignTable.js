// src/components/CampaignTable.jsx

import React from 'react';
import { PencilIcon, TrashIcon, EyeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import Button from './Button';

const CampaignTable = ({ campaigns, onView, onEdit, onDelete, onUpdateStatus }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left">Type</th>
            <th className="py-3 px-6 text-left">Created At</th>
            <th className="py-3 px-6 text-left">Last Sent At</th>
            <th className="py-3 px-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-400 text-sm font-light">
          {campaigns.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-3 px-6 text-center">
                No campaigns found.
              </td>
            </tr>
          ) : (
            campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="border-b border-gray-700 hover:bg-gray-600"
              >
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  {campaign.name}
                </td>
                <td className="py-3 px-6 text-left">
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </td>
                <td className="py-3 px-6 text-left">
                  {campaign.campaign_type.charAt(0).toUpperCase() + campaign.campaign_type.slice(1)}
                </td>
                <td className="py-3 px-6 text-left">
                  {new Date(campaign.createdDate).toLocaleString()}
                </td>
                <td className="py-3 px-6 text-left">
                  {campaign.lastSentAt ? new Date(campaign.lastSentAt).toLocaleString() : '—'}
                </td>
                <td className="py-3 px-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onView(campaign.id)}
                      className="text-blue-500 hover:text-blue-700"
                      aria-label={`View Campaign ${campaign.name}`}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(campaign.id)}
                      className="text-yellow-500 hover:text-yellow-700"
                      aria-label={`Edit Campaign ${campaign.name}`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(campaign.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Delete Campaign ${campaign.name}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onUpdateStatus(campaign)}
                      className="text-purple-500 hover:text-purple-700"
                      aria-label={`Update Status of Campaign ${campaign.name}`}
                    >
                      <ExclamationTriangleIcon className="h-5 w-5" />
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

export default CampaignTable;