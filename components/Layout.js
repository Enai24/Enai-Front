// src/components/Layout.js
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-60"> {/* Adjust margin-left to match sidebar width */}
        <Navbar />
        <div className="p-4 bg-gray-50 min-h-screen">{children}</div>
      </div>
    </div>
  );
};

export default Layout;