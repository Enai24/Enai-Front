// src/components/ResultsDisplay.jsx

import React from 'react';
import PropTypes from 'prop-types';

const ResultsDisplay = ({ companies, leads }) => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg mt-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-2">Identified Companies</h3>
      <ul className="mb-4">
        {companies.map((company) => (
          <li key={company.id} className="flex justify-between items-center py-2 border-b border-gray-700">
            <span>{company.name}</span>
            <span className="text-sm text-gray-400">{company.headcount} Employees</span>
          </li>
        ))}
      </ul>
      <h3 className="text-lg font-semibold text-gray-100 mb-2">Estimated Leads</h3>
      <table className="w-full text-sm text-left text-gray-400">
        <thead className="text-xs uppercase bg-gray-700">
          <tr>
            <th className="px-6 py-3">Contact Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Lead Type</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-gray-700">
              <td className="px-6 py-4">{lead.name}</td>
              <td className="px-6 py-4">{lead.email}</td>
              <td className="px-6 py-4">{lead.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

ResultsDisplay.propTypes = {
  companies: PropTypes.array.isRequired,
  leads: PropTypes.array.isRequired,
};

export default ResultsDisplay;