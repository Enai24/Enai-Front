// src/pages/ViewReport.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchReportById, deleteReport } from '../services/api';
import ReportView from '../components/ReportView';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const ViewReport = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal state for confirming deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchReport = async () => {
    try {
      const fetchedReport = await fetchReportById(reportId);
      setReport(fetchedReport);
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

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteReport(report.id);
      toast.success('Report deleted successfully.');
      setIsDeleteModalOpen(false);
      navigate('/dashboard/reports/');
    } catch (err) {
      console.error('Error deleting report:', err);
      toast.error('Failed to delete report.');
      setIsDeleteModalOpen(false);
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
      <ReportView report={report} onDelete={handleDelete} />

      {/* Confirm Delete Modal */}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          closeModal={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName={report.title}
        />
      )}
    </div>
  );
};

export default ViewReport;