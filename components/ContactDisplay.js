// src/components/ContactDisplay.js
import React from 'react';
import PropTypes from 'prop-types';

const ContactDisplay = ({ contacts }) => {
  if (!contacts || contacts.length === 0) {
    return <p className="text-gray-300">No contacts available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Phone
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {contacts.map(contact => (
            <tr key={contact.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {contact.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {contact.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                {contact.phone || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ContactDisplay.propTypes = {
  contacts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      phone: PropTypes.string,
    })
  ).isRequired,
};

export default ContactDisplay;