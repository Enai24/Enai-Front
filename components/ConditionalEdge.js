// src/components/ConditionalEdge.jsx

import React from 'react';
import { getBezierPath, getMarkerEnd } from 'react-flow-renderer';

const ConditionalEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const marker = getMarkerEnd(markerEnd);

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={marker} />
      <text>
        <textPath href={`#${id}`} style={{ fontSize: 12 }} startOffset="50%" textAnchor="middle">
          Yes
        </textPath>
      </text>
    </>
  );
};

export default ConditionalEdge;