// src/components/CustomNodes.js

import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import PropTypes from 'prop-types';

// Generic Custom Node Component
export const CustomNode = ({ data }) => {
  return (
    <div className={`p-2 rounded-md border ${data.nodeTypeColor} text-white`}>
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};


export const nodeTypeConfigs = {
    trigger: { label: 'Trigger: Lead Created', nodeTypeColor: 'bg-blue-600' },
    input: { label: 'Input: Target Criteria', nodeTypeColor: 'bg-purple-600' },
    action: { label: 'Action: Fetch Leads', nodeTypeColor: 'bg-green-600' },
    condition: { label: 'Condition: Qualification Check', nodeTypeColor: 'bg-yellow-600' },
    delay: { label: 'Delay: 48 Hours', nodeTypeColor: 'bg-gray-600' },
    dataEnrichment: { label: 'Data Enrichment', nodeTypeColor: 'bg-teal-600' },
    end: { label: 'End', nodeTypeColor: 'bg-red-600' },
  };

CustomNode.propTypes = {
  data: PropTypes.object.isRequired,
};