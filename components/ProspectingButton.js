// src/components/ProspectingButton.jsx
import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProspectingButton = () => {
  const handleProspect = async () => {
    try {
      await axios.post('/api/prospecting/');
      toast.success("Autonomous prospecting initiated.");
    } catch (error) {
      toast.error("Failed to start prospecting.");
    }
  };

  return (
    <button onClick={handleProspect} className="bg-red-600 px-4 py-2 rounded text-white">
      Start Autonomous Prospecting
    </button>
  );
};

export default ProspectingButton;