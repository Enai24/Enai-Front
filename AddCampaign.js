// src/pages/AddCampaign.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createCampaign } from '../services/api';
import CampaignForm from '../components/CampaignForm';
import { toast } from 'react-toastify';

const AddCampaign = () => {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      const response = await createCampaign(data);
      toast.success('Campaign created successfully.');
      navigate('/dashboard/campaigns/');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-100">Add New Campaign</h1>
      <CampaignForm onSubmit={handleCreate} />
    </div>
  );
};

export default AddCampaign;