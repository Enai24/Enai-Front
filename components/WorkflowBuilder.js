// src/components/WorkflowBuilder.jsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'react-flow-renderer';
import { toast } from 'react-toastify';
import axios from 'axios';
import Sidebar from './WorkflowSidebar';
import WorkflowNodeEditor from './WorkflowNodeEditor';
import { CustomNode, nodeTypeConfigs } from './CustomNodes'; // Import node configurations

const nodeTypes = {
  customNode: CustomNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'customNode',
    data: { label: nodeTypeConfigs.trigger.label, nodeTypeColor: nodeTypeConfigs.trigger.nodeTypeColor, nodeType: 'trigger' },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    type: 'customNode',
    data: { label: nodeTypeConfigs.end.label, nodeTypeColor: nodeTypeConfigs.end.nodeTypeColor, nodeType: 'end' },
    position: { x: 250, y: 500 },
  },
];

const initialEdges = [];

const WorkflowBuilder = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  // State for node editor modal
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  // Define available node types excluding Start and End nodes
  const availableNodeTypes = [
    { type: 'input', label: 'Input: Target Criteria', color: 'bg-purple-600' },
    { type: 'action', label: 'Action: Fetch Leads', color: 'bg-green-600' },
    { type: 'condition', label: 'Condition: Qualification Check', color: 'bg-yellow-600' },
    { type: 'delay', label: 'Delay: 48 Hours', color: 'bg-gray-600' },
    { type: 'dataEnrichment', label: 'Data Enrichment', color: 'bg-teal-600' },
  ];
  
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({
    ...params,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }, eds)), [setEdges]);

  const onLoad = (instance) => setReactFlowInstance(instance);

  // Handle node selection
  const onElementClick = (event, element) => {
    if (element.type !== 'customNode') return; // Only custom nodes are editable
    if (element.data.nodeType === 'trigger' || element.data.nodeType === 'end') return; // Prevent editing Start and End nodes
    setSelectedNode(element);
    setIsEditorOpen(true);
  };

  // Handle node update from editor
  const handleNodeUpdate = (updatedNodeData) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === updatedNodeData.id ? { ...node, data: updatedNodeData.data } : node))
    );
    toast.success('Node updated successfully!');
  };

  // Handle adding new node from sidebar
  const addNode = (nodeType) => {
    const id = (nodes.length + 1).toString();
    const nodeConfig = nodeTypeConfigs[nodeType];
    const newNode = {
      id,
      type: 'customNode',
      data: { label: nodeConfig.label, nodeTypeColor: nodeConfig.nodeTypeColor, nodeType },
      position: {
        x: Math.random() * 250,
        y: Math.random() * 250,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleSaveWorkflow = async () => {
    try {
      const formattedNodes = nodes.map((node) => ({
        id: node.id,
        type: node.data.nodeType,
        data: node.data,
        position: node.position,
      }));

      const payload = {
        name: 'AI-Driven Lead Workflow',
        description: 'Workflow for lead identification and qualification',
        nodes: formattedNodes,
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'default',
        })),
      };

      await axios.post('/api/workflows/', payload);
      toast.success('Workflow saved successfully!');
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar for node selection */}
      <Sidebar nodeTypes={availableNodeTypes} addNode={addNode} />

      {/* React Flow Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onLoad={onLoad}
          nodeTypes={nodeTypes}
          onElementClick={onElementClick}
          fitView
          attributionPosition="bottom-left"
        >
          <MiniMap nodeStrokeColor={(n) => {
            if (n.type === 'input') return '#0041d0';
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.type === 'input') return '#0041d0';
            return '#fff';
          }} />
          <Controls />
          <Background color="#555" gap={16} />
        </ReactFlow>
        {/* Save Workflow Button */}
        <button
          onClick={handleSaveWorkflow}
          className="absolute bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded shadow-lg hover:bg-green-700"
        >
          Save Workflow
        </button>
      </div>

      {/* Node Editor Modal */}
      {isEditorOpen && selectedNode && (
        <WorkflowNodeEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          nodeData={selectedNode.data}
          onSave={handleNodeUpdate}
        />
      )}
    </div>
  );
};

export default WorkflowBuilder;