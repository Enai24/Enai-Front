import React from 'react';

const LeadTabs = ({ activeTab, setActiveTab, additionalTabs = [] }) => {
  // Base tabs with proper titles
  const baseTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'notes', label: 'Notes' },
    { id: 'emails', label: 'Emails' },
  ];

  // Combine base tabs with additional tabs (if provided)
  const tabs = [...baseTabs, ...additionalTabs];

  return (
    <nav
      className="bg-gray-800 px-6 py-2 rounded-t-xl border-b border-gray-700 shadow-md"
      aria-label="Lead detail navigation tabs"
    >
      <ul className="flex flex-wrap space-x-8">
        {tabs.map((tab) => (
          <li key={tab.id} className="relative">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-2 text-sm font-medium text-gray-300 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-800 ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-900 text-white'
                  : 'border-b-2 border-transparent hover:text-white hover:border-gray-600'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              aria-label={`Switch to ${tab.label} tab`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default React.memo(LeadTabs);