// src/components/ReportView.js

import React from 'react';
import Button from './Button';
import { Link } from 'react-router-dom';

const ReportView = ({ report, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Report Details</h2>
      <table className="min-w-full table-auto">
        <tbody>
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <td className="px-4 py-2">{report.title}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Description</th>
            <td className="px-4 py-2 whitespace-pre-wrap">{report.description || '—'}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Created At</th>
            <td className="px-4 py-2">{new Date(report.created_at).toLocaleString()}</td>
          </tr>
          <tr>
            <th className="px-4 py-2 text-left">Updated At</th>
            <td className="px-4 py-2">{new Date(report.updated_at).toLocaleString()}</td>
          </tr>
          {/* Add more fields as necessary */}
        </tbody>
      </table>

      {/* Actions */}
      <div className="mt-6 flex space-x-2">
        <Link to={`/dashboard/reports/${report.id}/edit/`}>
          <Button variant="secondary">Edit Report</Button>
        </Link>
        <Button variant="danger" onClick={() => onDelete(report.id)}>
          Delete Report
        </Button>
        <Link to="/dashboard/reports/">
          <Button variant="secondary">Back to Reports</Button>
        </Link>
      </div>
    </div>
  );
};

export default ReportView;