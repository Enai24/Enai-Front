// src/pages/AddReport.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport } from '../services/api';
import ReportForm from '../components/ReportForm';
import { toast } from 'react-toastify';

const AddReport = () => {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      await createReport(data);
      toast.success('Report created successfully.');
      navigate('/dashboard/reports/');
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report.');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded shadow">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">Add New Report</h1>
      <ReportForm onSubmit={handleCreate} />
    </div>
  );
};

export default AddReport;