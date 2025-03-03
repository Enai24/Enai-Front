// Filepath: src/components/KnowledgeBase/KnowledgeBaseFilters.jsx
/**
 * @description
 *   This component renders the filtering UI for the Knowledge Base page.
 *   It allows users to search documents by keywords and serves as a placeholder for
 *   additional filters (e.g., by agent, status, and date range).
 *
 * @notes
 *   - The component is stateless; it receives `searchQuery` and `setSearchQuery` via props.
 */

import React from 'react';
import { Search as SearchIcon } from 'lucide-react';

const KnowledgeBaseFilters = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="flex items-center mb-6">
      <div className="relative flex-1">
        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Additional filter dropdowns (e.g., by agent, status, date range) can be added here */}
    </div>
  );
};

export default KnowledgeBaseFilters;