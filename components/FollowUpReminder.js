// src/components/FollowUpReminder.js
import React, { useState } from 'react';

const FollowUpReminder = ({ onSetReminder }) => {
  const [datetime, setDatetime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (datetime) {
      onSetReminder(datetime);
      setDatetime('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
        required
        className="bg-gray-700 text-gray-200 px-3 py-2 border border-gray-600 rounded"
      />
      <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded">
        Set Reminder
      </button>
    </form>
  );
};

export default FollowUpReminder;