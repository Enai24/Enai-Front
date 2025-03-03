// src/pages/AddICP.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createICP } from '../services/api';
import ICPForm from '../components/ICPForm';
import { toast } from 'react-toastify';

const AddICP = () => {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      await createICP(data);
      toast.success('ICP created successfully.');
      navigate('/dashboard/icps/');
    } catch (error) {
      console.error('Error creating ICP:', error);
      toast.error('Failed to create ICP.');
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded shadow">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">Add New ICP</h1>
      <ICPForm onSubmit={handleCreate} />
    </div>
  );
};

export default AddICP;