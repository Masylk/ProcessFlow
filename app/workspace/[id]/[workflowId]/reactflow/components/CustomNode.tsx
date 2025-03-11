import React, { useEffect, useState } from 'react';
import {
  Handle,
  Position,
  NodeProps,
  Edge,
  useReactFlow,
  Node,
} from '@xyflow/react';
import { NodeData } from '../types';
import { useModalStore } from '../store/modalStore';
import { useConnectModeStore } from '../store/connectModeStore';

interface CustomNodeProps extends NodeProps {
  data: NodeData & {
    onPreviewUpdate?: (edge: Edge | null) => void;
    // ... other data props
  };
}

function CustomNode({ id, data, selected }: CustomNodeProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { getNodes, setEdges, setNodes, getEdges } = useReactFlow();
  const setShowConnectModal = useModalStore(
    (state) => state.setShowConnectModal
  );
  const setConnectData = useModalStore((state) => state.setConnectData);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);

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

  const handleConnect = async (targetNodeId: string, label: string) => {
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
          label: label,
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
    setConnectData({
      sourceNode: {
        id,
        data,
        position: { x: 0, y: 0 },
        type: 'custom',
        width: undefined,
        height: undefined,
      } as Node,
    });
    setShowConnectModal(true);
    setShowDropdown(false);
  };

  const toggleStrokeLines = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('toggleStrokeLines', data.strokeLinesVisible);
    const blockId = parseInt(id.replace('block-', ''));
    data.updateStrokeLineVisibility?.(blockId, !data.strokeLinesVisible);
  };

  return (
    <>
      {/* Vertical Toggle Switch Container */}
      {getEdges().some(
        (edge) => edge.source === id && edge.type === 'strokeEdge'
      ) &&
        !isConnectMode && (
          <div
            className={`absolute top-[20px] -translate-y-1/2 transition-opacity duration-300 ${
              isConnectMode ? 'opacity-40' : ''
            }`}
            style={{
              left: '-20px',
              backgroundColor: '#FFFFFF',
              padding: '4px',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: '6px',
            }}
          >
            <div
              onClick={toggleStrokeLines}
              className="cursor-pointer"
              style={{
                width: '12px',
                height: '20px',
                borderRadius: '6px',
                backgroundColor: data.strokeLinesVisible
                  ? '#FF69A3'
                  : '#E5E7EB',
                transition: 'background-color 0.2s',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  position: 'absolute',
                  left: '1px',
                  top: data.strokeLinesVisible ? '1px' : '9px',
                  transition: 'top 0.2s',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              />
            </div>
          </div>
        )}

      <div
        className={`transition-all duration-300 ${
          isConnectMode && !(data.isSourceNode || data.isSelectedNode)
            ? 'opacity-40'
            : ''
        } ${isHighlighted ? 'scale-105' : ''}`}
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
      </div>
    </>
  );
}

export default CustomNode;
