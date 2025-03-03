// src/pages/ViewCampaign.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCampaignById, updateCampaignStatus } from '../services/api';
import CampaignView from './CampaignView';
import { toast } from 'react-toastify';
import UpdateCampaignStatusModal from '../components/UpdateCampaignStatusModal';

const ViewCampaign = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal state for updating status
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const fetchCampaign = async () => {
    try {
      const fetchedCampaign = await fetchCampaignById(campaignId);
      setCampaign(fetchedCampaign);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError(true);
      setLoading(false);
      toast.error('Failed to fetch campaign details.');
    }
  };

  useEffect(() => {
    fetchCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const handleUpdateStatus = (campaign) => {
    setIsStatusModalOpen(true);
  };

  const handleConfirmUpdateStatus = async (id, status) => {
    try {
      await updateCampaignStatus(id, status);
      toast.success('Campaign status updated successfully.');
      setIsStatusModalOpen(false);
      // Refresh campaign details
      fetchCampaign();
    } catch (err) {
      console.error('Error updating campaign status:', err);
      toast.error('Failed to update campaign status.');
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error)
    return (
      <div className="text-center mt-10 text-red-500 dark:text-red-400">
        Error fetching campaign details.
      </div>
    );

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded shadow">
      <CampaignView campaign={campaign} onUpdateStatus={handleUpdateStatus} />

      {/* Update Campaign Status Modal */}
      {isStatusModalOpen && (
        <UpdateCampaignStatusModal
          isOpen={isStatusModalOpen}
          closeModal={() => setIsStatusModalOpen(false)}
          onConfirm={handleConfirmUpdateStatus}
          campaign={campaign}
        />
      )}
    </div>
  );
};

export default ViewCampaign;