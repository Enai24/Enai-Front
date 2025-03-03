// src/components/RetrainModelButton.jsx
import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const RetrainModelButton = () => {
  const handleRetrain = async () => {
    try {
      await axios.post('/api/trigger_retrain/');
      toast.success("AI model retraining initiated.");
    } catch (error) {
      toast.error("Failed to initiate retraining.");
    }
  };

  return (
    <button onClick={handleRetrain} className="bg-purple-600 px-4 py-2 rounded text-white">
      Retrain AI Model
    </button>
  );
};

export default RetrainModelButton;