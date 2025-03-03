// src/pages/EditReport.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchReportById, updateReport } from '../services/api';
import ReportForm from '../components/ReportForm';
import { toast } from 'react-toastify';

const EditReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchReport = async () => {
    try {
      const report = await fetchReportById(reportId);
      setInitialData(report);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(true);
      setLoading(false);
      toast.error('Failed to fetch report details.');
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const handleUpdate = async (data) => {
    try {
      await updateReport(reportId, data);
      toast.success('Report updated successfully.');
      navigate(`/dashboard/reports/${reportId}/`);
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Failed to update report.');
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error)
    return (
      <div className="text-center mt-10 text-red-500 dark:text-red-400">
        Error fetching report details.
      </div>
    );

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded shadow">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">Edit Report</h1>
      <ReportForm initialData={initialData} onSubmit={handleUpdate} />
    </div>
  );
};

export default EditReport;