// src/pages/EditCampaign.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchCampaignById, updateCampaign } from '../services/api';
import CampaignForm from '../components/CampaignForm';
import { toast } from 'react-toastify';

const EditCampaign = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCampaign = async () => {
    try {
      const campaign = await fetchCampaignById(campaignId);
      setInitialData(campaign);
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

  const handleUpdate = async (data) => {
    try {
      await updateCampaign(campaignId, data);
      toast.success('Campaign updated successfully.');
      navigate(`/dashboard/campaigns/${campaignId}/`);
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast.error('Failed to update campaign.');
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
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">Edit Campaign</h1>
      <CampaignForm initialData={initialData} onSubmit={handleUpdate} />
    </div>
  );
};

export default EditCampaign;