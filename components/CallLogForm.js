// src/components/CallLogForm.js
import React, { useState } from 'react';

const CallLogForm = ({ onLogCall }) => {
  const [formData, setFormData] = useState({
    outcome: '',
    notes: '',
    duration: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogCall(formData);
    setFormData({ outcome: '', notes: '', duration: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-gray-800 p-6 rounded-xl shadow-lg text-white">
      <div>
        <label className="block text-gray-300">Call Outcome</label>
        <select
          name="outcome"
          value={formData.outcome}
          onChange={handleChange}
          required
          className="w-full bg-gray-700 text-gray-200 px-3 py-2 border border-gray-600 rounded"
        >
          <option value="">Select Outcome</option>
          <option value="Connected">Connected</option>
          <option value="Voicemail">Voicemail</option>
          <option value="Not Interested">Not Interested</option>
          <option value="No Answer">No Answer</option>
        </select>
      </div>
      <div>
        <label className="block text-gray-300">Duration (minutes)</label>
        <input
          type="number"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
          min="0"
          className="w-full bg-gray-700 text-gray-200 px-3 py-2 border border-gray-600 rounded"
        />
      </div>
      <div>
        <label className="block text-gray-300">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="3"
          className="w-full bg-gray-700 text-gray-200 px-3 py-2 border border-gray-600 rounded resize-none"
        ></textarea>
      </div>
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Log Call
      </button>
    </form>
  );
};

export default CallLogForm;