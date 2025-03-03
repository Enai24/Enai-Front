// src/components/WorkflowSidebar.jsx

import React from 'react';
import PropTypes from 'prop-types';

const WorkflowSidebar = ({ nodeTypes, addNode }) => {
  return (
    <div className="w-60 bg-gray-800 p-4 text-gray-100">
      <h3 className="text-lg font-semibold mb-4">Add Node</h3>
      <ul>
        {nodeTypes.map((node) => (
          <li key={node.type} className="mb-2">
            <button
              onClick={() => addNode(node.type)}
              className="w-full px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 flex items-center justify-between"
            >
              {node.label}
              <span className="text-sm">+</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

WorkflowSidebar.propTypes = {
  nodeTypes: PropTypes.array.isRequired,
  addNode: PropTypes.func.isRequired,
};

export default WorkflowSidebar;