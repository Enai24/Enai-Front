import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,       // For Deals
  MegaphoneIcon,           // For Campaigns
  PhoneIcon,
  EnvelopeIcon,
  AdjustmentsHorizontalIcon, // For Automation
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import logo from '../assets/logo.png'; // Ensure logo exists

// 1. Import your Auth context
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isExpanded, toggleSidebar }) => {
  // 2. Destructure the logout function from your Auth context
  const { logout } = useAuth();

  // 3. Use unique icons for each route
  const navigation = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Leads', path: '/leads', icon: UserGroupIcon },
    { name: 'Deals', path: '/dashboard/deals', icon: CurrencyDollarIcon },
    { name: 'Campaigns', path: '/dashboard/campaigns', icon: MegaphoneIcon },
    { name: 'Calls', path: '/dashboard/calls', icon: PhoneIcon },
    { name: 'Emails', path: '/dashboard/emails', icon: EnvelopeIcon },
    { name: 'Automation', path: '/automation', icon: AdjustmentsHorizontalIcon },
    { name: 'Reports', path: '/dashboard/reports', icon: ChartBarIcon },
    { name: 'Settings', path: '/settings', icon: CogIcon },
  ];

  return (
    <div
      className={`h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100 flex flex-col fixed top-0 left-0 transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? 'w-60' : 'w-20'
      }`}
    >
      {/* Logo + Toggle Button */}
      <div className="flex items-center justify-between h-16 bg-gray-900 px-4">
        <div className="flex items-center">
          <img
            src={logo}
            alt="ENAI Logo"
            className={`h-8 w-auto transition-transform duration-300 ${
              isExpanded ? 'scale-100' : 'scale-0'
            }`}
          />
          <h1
            className={`text-2xl font-bold text-orange-500 ml-2 transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0 w-0'
            }`}
          >
            ENAI
          </h1>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <span className="sr-only">Toggle Sidebar</span>
          {isExpanded ? (
            <svg
              className="h-6 w-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-out ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              } ${isExpanded ? 'justify-start' : 'justify-center'}`
            }
          >
            {({ isActive }) => (
              <>
                {React.createElement(item.icon, {
                  className: `h-6 w-6 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-400'
                  }`,
                  'aria-hidden': true,
                })}
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    isExpanded ? 'opacity-100' : 'opacity-0 absolute -left-96'
                  }`}
                >
                  {item.name}
                </span>
                {!isExpanded && (
                  <span className="absolute left-16 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    {item.name}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-2 py-4">
        <button
          type="button"
          // 4. Call your logout function here (already provided by useAuth)
          onClick={logout}
          className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-all duration-200 shadow-md ${
            isExpanded ? 'justify-start' : 'justify-center'
          }`}
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" aria-hidden="true" />
          <span
            className={`ml-3 transition-opacity duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0 absolute -left-96'
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;