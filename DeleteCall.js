// src/pages/DeleteCall.js
import React from 'react';

const DeleteCall = ({ call, onDelete }) => {
  const handleDelete = () => {
    // Add your API call logic for deletion
    console.log('Deleting call:', call.id);
    if (onDelete) onDelete(call.id);
  };

  return (
    <div className="container">
      <h1 className="mb-4">Delete Call</h1>
      <p>
        Are you sure you want to delete the call to{' '}
        <strong>{call.phone_number}</strong>?
      </p>
      <button onClick={handleDelete} className="btn btn-danger">
        Confirm Delete
      </button>
      <a href="/calls" className="btn btn-secondary">
        Cancel
      </a>
    </div>
  );
};

export default DeleteCall;