// src/components/RecentActivity.jsx
import React, { useState } from 'react';
import { Brain, Mail, Users, PhoneCall } from 'lucide-react';

const typeToIcon = {
  'ai_deployment': Brain,
  'email': Mail,
  'lead': Users,
  'call': PhoneCall,
};

export function RecentActivity({ activities }) {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const displayedActivities = activities.slice(0, page * itemsPerPage);

  const loadMore = () => setPage(prev => prev + 1);

  return (
    <div className="space-y-4">
      {displayedActivities.length === 0 ? (
        <p className="text-gray-400">No recent activity available.</p>
      ) : (
        displayedActivities.map((activity, index) => {
          const Icon = typeToIcon[activity.type] || Users;
          return (
            <div key={index} className="flex items-center bg-gray-700 p-4 rounded-lg shadow-sm">
              <Icon className="h-6 w-6 text-blue-400 mr-4" />
              <div>
                <h4 className="text-white font-medium">{activity.description.split(' ')[0]}</h4>
                <p className="text-sm text-gray-400">{activity.description}</p>
                <span className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleString()}</span>
              </div>
            </div>
          );
        })
      )}
      {displayedActivities.length < activities.length && (
        <div className="mt-4 text-center">
          <button onClick={loadMore} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm" aria-label="Load more activities">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default RecentActivity;