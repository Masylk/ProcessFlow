import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';
import { useConnectModeStore } from '../store/connectModeStore';

function BeginNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [pathName, setPathName] = useState(data.path?.name || '');
  const [isHovered, setIsHovered] = useState(false);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);

  const handleSave = async () => {
    try {
      if (!data.path?.id) return;

      // Update the path name
      const response = await fetch(`/api/paths/${data.path.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: pathName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update path name');
      }

      // Fetch all updated paths
      const pathsResponse = await fetch(
        `/api/workspace/${data.path.workflow_id}/paths?workflow_id=${data.path.workflow_id}`
      );

      if (!pathsResponse.ok) {
        throw new Error('Failed to fetch updated paths');
      }

      const pathsData = await pathsResponse.json();
      data.onPathsUpdate?.(pathsData.paths);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating path name:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setPathName(data.path?.name || '');
    }
  };

  return (
    <div
      className={`relative transition-all duration-300 flex items-center justify-center ${isConnectMode ? 'opacity-40' : ''}`}
      style={{
        width: '200px',
        height: '50px',
        padding: '12px 16px',
        borderRadius: '8px',
        border: selected ? '2px solid #60a5fa' : '2px solid #93c5fd',
        background: '#eff6ff',
        position: 'relative',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Add block ID display */}
      <div className="absolute -top-6 left-0 text-xs text-gray-500">
        ID: {id.replace('block-', '')}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          width: 8,
          height: 8,
          background: '#60a5fa',
          border: '2px solid white',
        }}
      />

      <div className="text-blue-600 font-medium truncate">
        {isEditing ? (
          <input
            type="text"
            value={pathName}
            onChange={(e) => setPathName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className="bg-transparent outline-none w-full text-center"
            placeholder="Enter path name"
          />
        ) : (
          <span>{data.path?.name || 'Path'}</span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          width: 8,
          height: 8,
          background: '#60a5fa',
          border: '2px solid white',
        }}
      />

      {/* Edit button that appears on hover */}
      {isHovered && !isEditing && (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute -right-2 -top-2 p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-icon.svg`}
            alt="Edit"
            className="w-3 h-3"
          />
        </button>
      )}
    </div>
  );
}

export default BeginNode;
