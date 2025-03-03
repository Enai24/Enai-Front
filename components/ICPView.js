// src/components/ICPView.js

import React from 'react';
import Button from './Button';
import { Link } from 'react-router-dom';

const ICPView = ({ icp, onUpdate }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">ICP Details</h2>
      <table className="min-w-full table-auto">
        <tbody>
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <td className="px-4 py-2">{icp.name}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Job Title</th>
            <td className="px-4 py-2">{icp.job_title || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Industry</th>
            <td className="px-4 py-2">{icp.industry || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Company HQ Location</th>
            <td className="px-4 py-2">{icp.company_hq_location || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Contact Location</th>
            <td className="px-4 py-2">{icp.contact_location || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Company Size</th>
            <td className="px-4 py-2">{icp.company_size || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Keywords</th>
            <td className="px-4 py-2">{icp.keywords || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Created At</th>
            <td className="px-4 py-2">{new Date(icp.created_at).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Actions */}
      <div className="mt-6 flex space-x-2">
        <Link to={`/dashboard/icps/${icp.id}/edit/`}>
          <Button variant="secondary">Edit ICP</Button>
        </Link>
        <Button variant="warning" onClick={() => onUpdate(icp)}>
          Update Status
        </Button>
        <Link to="/dashboard/icps/">
          <Button variant="secondary">Back to ICPs</Button>
        </Link>
      </div>
    </div>
  );
};

export default ICPView;