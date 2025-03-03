// src/components/EmailTable.jsx
import React, { useMemo } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

const EmailTable = React.memo(({ emails, onView, onEdit, onDelete, onSendTest, onSortChange, currentOrdering }) => {
  const getSortIcon = (field) => {
    if (currentOrdering === field) return '↑';
    if (currentOrdering === `-${field}`) return '↓';
    return '';
  };

  const headers = useMemo(() => [
    { label: 'Recipient', field: 'recipient' },
    { label: 'Subject', field: 'subject' },
    { label: 'Status', field: 'status' },
    { label: 'Sent At', field: 'sent_at' },
    { label: 'Actions', field: null },
  ], []);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 dark:bg-gray-900 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-700 text-gray-200 uppercase text-sm leading-normal">
            {headers.map(({ label, field }) => (
              <th
                key={label}
                className="py-3 px-6 text-left cursor-pointer"
                onClick={field ? () => onSortChange(field) : undefined}
                aria-label={field ? `Sort by ${label}` : label}
              >
                {label} {field && getSortIcon(field)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-300 text-sm font-light">
          {emails.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-3 px-6 text-center">No emails found.</td>
            </tr>
          ) : (
            emails.map((email) => (
              <tr key={email.id} className="border-b border-gray-700 hover:bg-gray-600">
                <td className="py-3 px-6 text-left whitespace-nowrap">{email.recipient}</td>
                <td className="py-3 px-6 text-left">{email.subject}</td>
                <td className="py-3 px-6 text-left">{email.status ? email.status.charAt(0).toUpperCase() + email.status.slice(1) : '—'}</td>
                <td className="py-3 px-6 text-left">{email.sent_at ? new Date(email.sent_at).toLocaleString() : '—'}</td>
                <td className="py-3 px-6 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onView(email.id)}
                      className="text-blue-500 hover:text-blue-700"
                      title="View Email"
                      aria-label={`View Email ${email.subject}`}
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEdit(email.id)}
                      className="text-yellow-500 hover:text-yellow-700"
                      title="Edit Email"
                      aria-label={`Edit Email ${email.subject}`}
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(email.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Email"
                      aria-label={`Delete Email ${email.subject}`}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onSendTest(email.id)}
                      className="text-green-500 hover:text-green-700"
                      title="Send Test Email"
                      aria-label={`Send Test Email ${email.subject}`}
                    >
                      <EnvelopeIcon className="h-5 w-5" />
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
});

export default EmailTable;