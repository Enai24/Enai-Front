// src/components/ActivityTimeline.js
import React from 'react';

const ActivityTimeline = ({ activities = [] }) => {
  if (!activities.length) {
    return <p className="text-gray-400">No activities yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {activities.map((act) => (
        <li key={act.id} className="border-l border-gray-600 pl-4 relative">
          <span className="absolute w-2 h-2 bg-blue-500 rounded-full left-[-5px] top-1.5" />
          <div className="text-sm text-gray-100">
            <strong>{act.activity_type}</strong> — {act.description}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(act.timestamp).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ActivityTimeline;