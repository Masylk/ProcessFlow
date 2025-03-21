import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../types';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { usePathsStore } from '../../store/pathsStore';
import DeletePathModal from '../modals/DeletePathModal';

function BeginNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [pathName, setPathName] = useState(data.path?.name || '');
  const [isHovered, setIsHovered] = useState(false);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handlePathNameUpdate = async () => {
    try {
      const response = await fetch(`/api/paths/${data.path?.id}`, {
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

      const updatedPath = await response.json();

      // Update the path in allPaths while preserving existing data
      const updatedPaths = allPaths.map((path) =>
        path.id === updatedPath.id
          ? { ...path, ...updatedPath } // Merge the update with existing data
          : path
      );

      // Update global state
      setAllPaths(updatedPaths);

      // Notify parent of update
      data.onPathsUpdate?.(updatedPaths);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating path name:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePathNameUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setPathName(data.path?.name || '');
    }
  };

  const handleDeletePath = async () => {
    try {
      const response = await fetch(`/api/paths/${data.path?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete path');
      }

      // Fetch updated paths
      const pathsResponse = await fetch(
        `/api/workspace/${data.path?.workflow_id}/paths?workflow_id=${data.path?.workflow_id}`
      );

      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        setAllPaths(pathsData.paths);
        data.onPathsUpdate?.(pathsData.paths);
      }
    } catch (error) {
      console.error('Error deleting path:', error);
    }
  };

  const canDelete =
    data.path?.parent_blocks && data.path?.parent_blocks.length !== 0;

  return (
    <>
      <div
        className={`relative transition-all duration-300 flex items-center justify-center ${isConnectMode || isEditMode ? 'opacity-40' : ''}`}
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
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            width: 8,
            height: 8,
            opacity: 0,
            background: '#60a5fa',
            border: '2px solid white',
            pointerEvents: 'none',
          }}
        />

        <div className="text-blue-600 font-medium truncate">
          {isEditing ? (
            <input
              type="text"
              value={pathName}
              onChange={(e) => setPathName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handlePathNameUpdate}
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
            opacity: 0,
            background: '#60a5fa',
            border: '2px solid white',
            pointerEvents: 'none',
          }}
        />

        {/* Edit and Delete buttons that appear on hover */}
        {isHovered && !isEditing && (
          <div className="absolute -right-2 -top-2 flex gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-icon.svg`}
                alt="Edit"
                className="w-3 h-3"
              />
            </button>
            {canDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
                  alt="Delete"
                  className="w-3 h-3"
                />
              </button>
            )}
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeletePathModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeletePath}
          pathName={data.path?.name || 'this path'}
        />
      )}
    </>
  );
}

export default BeginNode;
