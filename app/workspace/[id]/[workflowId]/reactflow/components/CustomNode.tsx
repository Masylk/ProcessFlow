import React, { useEffect, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { NodeData } from '../types';
import ConnectNodeModal from './ConnectNodeModal';

function CustomNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { getNodes, setEdges, setNodes, getEdges } = useReactFlow();

  // Handle highlight effect
  useEffect(() => {
    if (data.highlighted) {
      setIsHighlighted(true);
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [data.highlighted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onDelete?.(id);
    setShowDropdown(false);
  };

  const handleConnect = async (targetNodeId: string) => {
    try {
      if (!data.path) {
        throw new Error('Path not found');
      }
      const response = await fetch('/api/stroke-lines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_block_id: parseInt(id.replace('block-', '')),
          target_block_id: parseInt(targetNodeId.replace('block-', '')),
          workflow_id: data.path.workflow_id,
          label: 'Connection',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create connection');
      }

      // Close modals
      setShowConnectModal(false);
      setShowDropdown(false);

      // Fetch updated stroke lines and update the flow
      const strokeLinesResponse = await fetch(
        `/api/stroke-lines?workflow_id=${data.path.workflow_id}`
      );
      if (strokeLinesResponse.ok) {
        const strokeLines = await strokeLinesResponse.json();
        // The Flow component will handle the update through its strokeLines prop
        data.onStrokeLinesUpdate?.(strokeLines);
      }
    } catch (error) {
      console.error('Error creating connection:', error);
    }
  };

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConnectModal(true);
    setShowDropdown(false);
  };

  const toggleStrokeLines = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentVisibility = data.strokeLinesVisible ?? true; // Default to true if undefined
    console.log('Current visibility:', currentVisibility);

    const newVisibility = !currentVisibility;
    console.log('New visibility:', newVisibility);

    setNodes(
      getNodes().map((node) => {
        if (node.id === id) {
          console.log('Updating node:', node.id);
          return {
            ...node,
            data: {
              ...node.data,
              strokeLinesVisible: newVisibility,
            },
          };
        }
        return node;
      })
    );

    // Filter edges based on new visibility state
    const currentEdges = getEdges();
    console.log('Current edges:', currentEdges);

    const updatedEdges = currentEdges.filter((edge) => {
      if (edge.source === id && edge.type === 'strokeEdge') {
        return newVisibility; // Keep edges if visible, remove if hidden
      }
      return true; // Keep all other edges
    });

    console.log('Updated edges:', updatedEdges);
    setEdges(updatedEdges);
  };

  return (
    <>
      <div
        className={`transition-all duration-300 ${isHighlighted ? 'scale-105' : ''}`}
        style={{
          width: '481px',
          padding: '20px 24px',
          borderRadius: '16px',
          border: isHighlighted
            ? '2px solid #3b82f6'
            : selected
              ? '2px solid #6366f1'
              : '2px solid #e5e7eb',
          background: isHighlighted ? '#f0f9ff' : 'white',
          boxShadow: isHighlighted
            ? '0 0 15px rgba(59, 130, 246, 0.5)'
            : selected
              ? '0 0 10px rgba(99, 102, 241, 0.3)'
              : 'none',
          minHeight: '120px',
          position: 'relative',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            width: 10,
            height: 10,
            background: '#b1b1b7',
            border: '2px solid white',
            opacity: 1,
          }}
        />
        <Handle
          type="source"
          position={Position.Left}
          id="stroke_source"
          style={{
            width: 8,
            height: 8,
            background: '#b1b1b7',
            border: '2px solid white',
            top: '35%',
            opacity: 1,
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="stroke_target"
          style={{
            width: 8,
            height: 8,
            background: '#b1b1b7',
            border: '2px solid white',
            top: '35%',
            left: -4,
            opacity: 1,
          }}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="stroke_self_target"
          style={{
            width: 8,
            height: 8,
            background: '#b1b1b7',
            border: '2px solid white',
            top: '65%',
            opacity: 1,
          }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{
            width: 10,
            height: 10,
            background: '#b1b1b7',
            border: '2px solid white',
            opacity: 1,
          }}
        />
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm text-gray-500">Position: {data.position}</div>
          <div className="relative">
            <button
              onClick={handleDropdownToggle}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
                alt="Menu"
                className="w-5 h-5"
              />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-1 py-1 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <button
                  onClick={handleConnectClick}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Connect node
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete node
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="text-gray-900">{data.label}</div>
        {getEdges().some(
          (edge) => edge.source === id && edge.type === 'strokeEdge'
        ) && (
          <button
            onClick={toggleStrokeLines}
            className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-50"
            title="Toggle stroke lines"
          >
            <svg
              className={`w-3 h-3 ${data.strokeLinesVisible ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
        )}
      </div>

      {showConnectModal && (
        <ConnectNodeModal
          onClose={() => setShowConnectModal(false)}
          onConfirm={handleConnect}
          sourceNode={{ id, data } as any}
          availableNodes={getNodes()}
        />
      )}
    </>
  );
}

export default CustomNode;
