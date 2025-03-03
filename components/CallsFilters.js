/**
 * @description
 *   The CallsFilters component provides UI controls to filter calls by search term,
 *   agent, status, and date range. It passes the selected values to the parent component.
 * @notes
 *   - Uses react-datepicker for date range selection.
 *   - Agents and statuses are currently mocked.
 */

import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Search } from 'lucide-react';

const CallsFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedAgent, 
  setSelectedAgent, 
  selectedStatus, 
  setSelectedStatus, 
  dateRange, 
  setDateRange 
}) => {
  // Mock data for agents and statuses
  const agents = [{ id: 1, name: 'Agent A' }, { id: 2, name: 'Agent B' }];
  const statuses = ['Completed', 'In Progress', 'No Answer', 'Failed'];

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {/* Search Field */}
      <div className="flex-1 relative">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search calls..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-700 text-white pl-12 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
      </div>
      {/* Agent Filter */}
      <select
        value={selectedAgent}
        onChange={(e) => setSelectedAgent(e.target.value)}
        className="bg-gray-700 text-white px-4 py-2 rounded-lg"
      >
        <option value="">All Agents</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.name}>
            {agent.name}
          </option>
        ))}
      </select>
      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        className="bg-gray-700 text-white px-4 py-2 rounded-lg"
      >
        <option value="">All Statuses</option>
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {/* Date Range Filters */}
      <div className="flex space-x-2">
        <DatePicker
          selected={dateRange.start}
          onChange={(date) => setDateRange({ ...dateRange, start: date })}
          selectsStart
          startDate={dateRange.start}
          endDate={dateRange.end}
          placeholderText="Start Date"
          className="bg-gray-700 text-white px-4 py-2 rounded-lg"
        />
        <DatePicker
          selected={dateRange.end}
          onChange={(date) => setDateRange({ ...dateRange, end: date })}
          selectsEnd
          startDate={dateRange.start}
          endDate={dateRange.end}
          minDate={dateRange.start}
          placeholderText="End Date"
          className="bg-gray-700 text-white px-4 py-2 rounded-lg"
        />
      </div>
    </div>
  );
};

export default CallsFilters;