// src/pages/ImportDeals.jsx

import React, { useState } from 'react';
import { processCsvUpload } from '../services/api';
import { toast } from 'react-toastify';
import Papa from 'papaparse';

const ImportDeals = () => {
  const [file, setFile] = useState(null);
  const [icpId, setIcpId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleIcpChange = (e) => {
    setIcpId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a CSV file.');
      return;
    }
    setLoading(true);

    // Parse CSV file using PapaParse
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const leadsData = results.data;
        try {
          // Send each lead to the backend
          for (let lead of leadsData) {
            await processCsvUpload(lead, icpId);
          }
          toast.success('Leads imported successfully!');
          setLoading(false);
        } catch (err) {
          console.error('Error importing leads:', err);
          toast.error('Failed to import leads.');
          setLoading(false);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast.error('Failed to parse CSV file.');
        setLoading(false);
      },
    });
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 rounded shadow">
      <h1 className="text-3xl font-semibold mb-6">Import Deals</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* CSV File */}
        <div>
          <label className="block text-gray-700">Select CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ICP Selection */}
        <div>
          <label className="block text-gray-700">Associate with ICP (Optional)</label>
          <select
            name="icp"
            value={icpId}
            onChange={handleIcpChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select ICP</option>
            {/* Populate ICP options dynamically */}
            <option value="1">ICP 1</option>
            <option value="2">ICP 2</option>
            {/* Add other ICPs */}
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-semibold text-white rounded-md ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Importing...' : 'Import Deals'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImportDeals;