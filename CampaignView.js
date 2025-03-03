// src/components/CampaignView.js

import React from 'react';
import Button from '../components/Button';
import { Link } from 'react-router-dom';

const CampaignView = ({ campaign, onUpdateStatus }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Campaign Details</h2>
      <table className="min-w-full table-auto">
        <tbody>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <td className="px-4 py-2">{campaign.name}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Status</th>
            <td className="px-4 py-2">{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Type</th>
            <td className="px-4 py-2">{campaign.campaign_type.charAt(0).toUpperCase() + campaign.campaign_type.slice(1)}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Start Date</th>
            <td className="px-4 py-2">{new Date(campaign.start_date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">End Date</th>
            <td className="px-4 py-2">{new Date(campaign.end_date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">ICP</th>
            <td className="px-4 py-2">{campaign.icp.name}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Email Template</th>
            <td className="px-4 py-2 whitespace-pre-wrap">{campaign.email_template || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">AI Recommendations</th>
            <td className="px-4 py-2 whitespace-pre-wrap">{campaign.ai_recommendations || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Created At</th>
            <td className="px-4 py-2">{new Date(campaign.created_at).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Leads Associated */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Associated Leads</h3>
        {campaign.leads.length > 0 ? (
          <ul className="list-disc list-inside">
            {campaign.leads.map((lead) => (
              <li key={lead.id}>
                {lead.name} - {lead.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No leads associated with this campaign.</p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex space-x-2">
        <Link to={`/dashboard/campaigns/${campaign.id}/edit/`}>
          <Button variant="secondary">Edit Campaign</Button>
        </Link>
        <Button variant="warning" onClick={() => onUpdateStatus(campaign)}>
          Update Status
        </Button>
        <Link to="/dashboard/campaigns/">
          <Button variant="secondary">Back to Campaigns</Button>
        </Link>
      </div>
    </div>
  );
};

export default CampaignView;