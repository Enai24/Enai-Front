import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createCall } from '../services/api';
import CallForm from '../components/CallForm';
import { toast } from 'react-toastify';

const AddCall = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreate = async (data) => {
    try {
      console.log("Submitting call data:", data);
      const result = await createCall(data);
      console.log("Create call response:", result);
      if (result.error) {
        toast.error(`Call failed: ${result.error}`);
      } else {
        toast.success("Call initiated successfully!");
        navigate("/dashboard/calls", { replace: true });
      }
    } catch (error) {
      console.error("Error creating call:", error);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white rounded shadow">
      <h1 className="text-3xl font-semibold mb-6">Add New Call</h1>
      <CallForm onSubmit={handleCreate} />
    </div>
  );
};

export default AddCall;