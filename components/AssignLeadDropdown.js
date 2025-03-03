// src/components/AssignLeadDropdown.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchUsers } from '../services/api';
import { ChevronDown } from 'lucide-react';

const AssignLeadDropdown = ({ onAssign }) => {
  const [users, setUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAssign = (userId) => {
    onAssign(userId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none"
      >
        Assign Leads
        <ChevronDown className="ml-2 h-5 w-5" />
      </button>
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => handleAssign(user.id)}
                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {user.first_name} {user.last_name} ({user.email})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

AssignLeadDropdown.propTypes = {
  onAssign: PropTypes.func.isRequired,
};

export default AssignLeadDropdown;