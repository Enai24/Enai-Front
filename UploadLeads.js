// src/pages/UploadLeads.jsx
import React, { useState } from 'react';
import { uploadLeadsCSV } from '../services/api';
import { toast } from 'react-toastify';

const UploadLeads = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warning('Please select a file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await uploadLeadsCSV(formData);
      toast.success('Leads uploaded successfully!');
    } catch (error) {
      console.error('Error uploading leads:', error);
      toast.error('Failed to upload leads.');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Upload Leads</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 text-gray-300">Select File</label>
          <input type="file" onChange={handleFileChange} className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2" required />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadLeads;