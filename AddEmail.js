// src/pages/AddEmail.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createEmail } from '../services/api';
import EmailForm from '../components/EmailForm';
import { toast } from 'react-toastify';

const AddEmail = () => {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    try {
      await createEmail(data); // Calls your backend to store the email record
      toast.success('Email created (saved) successfully.');
      navigate('/emails');
    } catch (error) {
      toast.error('Error creating email.');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Add New Email</h1>
      <EmailForm onSubmit={handleCreate} />
    </div>
  );
};

export default AddEmail;