// src/pages/ViewICP.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchICPById, deleteICP } from '../services/api';
import ICPView from '../components/ICPView';
import { toast } from 'react-toastify';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const ViewICP = () => {
  const { icpId } = useParams();
  const navigate = useNavigate();
  const [icp, setICP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchICP = async () => {
    try {
      const fetchedICP = await fetchICPById(icpId);
      setICP(fetchedICP);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching ICP:', err);
      setError(true);
      setLoading(false);
      toast.error('Failed to fetch ICP details.');
    }
  };

  useEffect(() => {
    fetchICP();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [icpId]);

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteICP(icp.id);
      toast.success('ICP deleted successfully.');
      setIsDeleteModalOpen(false);
      navigate('/dashboard/icps/');
    } catch (err) {
      console.error('Error deleting ICP:', err);
      toast.error('Failed to delete ICP.');
      setIsDeleteModalOpen(false);
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500 dark:text-red-400">Error fetching ICP details.</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded shadow">
      <ICPView icp={icp} onUpdate={() => { /* Implement if needed */ }} />
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          closeModal={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          itemName={icp.name}
        />
      )}
    </div>
  );
};

export default ViewICP;