// src/pages/EditEmail.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchEmailById, updateEmail } from '../services/api';
import EmailForm from '../components/EmailForm';
import { toast } from 'react-toastify';

const EditEmail = () => {
  const { emailId } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchEmail = async () => {
    try {
      const email = await fetchEmailById(emailId);
      setInitialData(email);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching email:', err);
      setError(true);
      setLoading(false);
      toast.error('Failed to fetch email details.');
    }
  };

  useEffect(() => {
    fetchEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailId]);

  const handleUpdate = async (data) => {
    try {
      await updateEmail(emailId, data);
      toast.success('Email updated successfully.');
      navigate(`/dashboard/emails/${emailId}/`);
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Failed to update email.');
    }
  };

  if (loading)
    return <div className="text-center mt-10 text-gray-800 dark:text-gray-200">Loading...</div>;
  if (error)
    return (
      <div className="text-center mt-10 text-red-500 dark:text-red-400">
        Error loading email details.
      </div>
    );

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-800 rounded shadow">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">Edit Email</h1>
      <EmailForm initialData={initialData} onSubmit={handleUpdate} />
    </div>
  );
};

export default EditEmail;