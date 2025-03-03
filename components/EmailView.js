// src/components/EmailView.js

import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const EmailView = ({ email, onSendTest }) => {
  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">
        Email Details
      </h2>
      <table className="min-w-full table-auto text-sm">
        <tbody>
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-400 w-32">
              Recipient:
            </th>
            <td className="px-4 py-2 text-gray-100">
              {email.recipient}
            </td>
          </tr>

          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-400">
              Subject:
            </th>
            <td className="px-4 py-2 text-gray-100">
              {email.subject}
            </td>
          </tr>

          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-400">
              Body:
            </th>
            <td className="px-4 py-2 text-gray-100 whitespace-pre-wrap">
              {email.body}
            </td>
          </tr>

          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-400">
              Status:
            </th>
            <td className="px-4 py-2 text-gray-100">
              {email.status
                ? email.status.charAt(0).toUpperCase() + email.status.slice(1)
                : '—'}
            </td>
          </tr>

          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-400">
              Sent At:
            </th>
            <td className="px-4 py-2 text-gray-100">
              {email.sent_at ? new Date(email.sent_at).toLocaleString() : '—'}
            </td>
          </tr>

          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-400">
              Lead:
            </th>
            <td className="px-4 py-2 text-gray-100">
              {email.lead
                ? `${email.lead.first_name} ${email.lead.last_name} (${email.lead.email})`
                : '—'}
            </td>
          </tr>

          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-400">
              Campaign:
            </th>
            <td className="px-4 py-2 text-gray-100">
              {email.campaign ? email.campaign.name : '—'}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-6 flex space-x-2">
        <Link to={`/dashboard/emails/${email.id}/edit/`}>
          <Button variant="secondary">Edit</Button>
        </Link>

        <Button variant="primary" onClick={() => onSendTest(email.id)}>
          Send Test Email
        </Button>

        <Link to="/dashboard/emails/">
          <Button variant="secondary">Back to Emails</Button>
        </Link>
      </div>
    </div>
  );
};

export default EmailView;