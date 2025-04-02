import React, { useState, useRef } from 'react';
import { Handle, Position, NodeProps, useStore } from '@xyflow/react';
import { NodeData } from '../../../types';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { usePathsStore } from '../../store/pathsStore';
import { useColors } from '@/app/theme/hooks';
import DeletePathModal from '../modals/DeletePathModal';

// Simple tooltip component
type TooltipProps = {
  content: string;
  children: React.ReactNode;
  show: boolean;
};

const Tooltip = ({ content, children, show }: TooltipProps) => {
  const colors = useColors();
  // Get the current zoom level from ReactFlow store
  const zoom = useStore((state) => state.transform[2]);
  
  if (!show) return <>{children}</>;
  
  return (
    <div className="relative">
      <div
        className="absolute left-0 right-0 w-full text-center bottom-full mb-2 z-50"
        style={{
          transform: `scale(${1 / zoom})`,
          transformOrigin: 'center bottom'
        }}
      >
        <div 
          className="inline-block py-1 px-2 rounded text-xs bg-opacity-90 whitespace-normal max-w-full mx-auto"
          style={{
            background: colors['bg-primary'],
            border: `1px solid ${colors['border-primary']}`,
            color: colors['text-primary'],
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            maxWidth: '200px',
            fontSize: `${Math.max(12, Math.min(16, 12 * (1 / zoom)))}px`,
          }}
        >
          {content}
        </div>
      </div>
      {children}
    </div>
  );
};

function BeginNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [pathName, setPathName] = useState(data.path?.name || '');
  const [isHovered, setIsHovered] = useState(false);
  const [isEditButtonHovered, setIsEditButtonHovered] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const colors = useColors();
  
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

  const hasMultipleParentBlocks =
    data.path?.parent_blocks && data.path?.parent_blocks.length > 1;
  
  return (
    <>
      {hasMultipleParentBlocks ? (
        <div className="transition-opacity duration-300">
          <Handle
            type="target"
            id="top"
            position={Position.Top}
            style={{
              background: '#b1b1b7',
              width: 1,
              height: 1,
              opacity: 0,
            }}
          />
          <div className="w-1 h-1 rounded-full bg-[#b1b1b7]" />
          <Handle
            type="source"
            id="bottom"
            position={Position.Bottom}
            style={{
              background: '#b1b1b7',
              width: 1,
              height: 1,
              opacity: 0,
            }}
          />
        </div>
      ) : (
        <div
          className={`relative transition-all duration-300 flex items-center justify-center ${
            isConnectMode ? 'opacity-40' : ''
          } ${isEditMode ? 'ring-2 ring-utility-brand-500' : ''}`}
          style={{
            width: '200px',
            height: '50px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: selected
              ? `2px solid ${colors['utility-brand-500']}`
              : `2px solid ${colors['utility-brand-400']}`,
            background: colors['utility-brand-100'],
            position: 'relative',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setShowTooltip(false);
          }}
        >
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            style={{
              width: 8,
              height: 8,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />

          <div className="w-full">
            {isEditing ? (
              <input
                type="text"
                value={pathName}
                onChange={(e) => setPathName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handlePathNameUpdate}
                autoFocus
                className="bg-transparent outline-none w-full text-center font-medium"
                style={{ color: colors['text-brand-primary'] }}
                placeholder="Enter path name"
              />
            ) : (
              <Tooltip 
                content={data.path?.name || 'Path'} 
                show={showTooltip}
              >
                <div
                  className="font-medium truncate text-center w-full cursor-default"
                  style={{ color: colors['text-brand-primary'] }}
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {data.path?.name || 'Path'}
                </div>
              </Tooltip>
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
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />

          {/* Edit and Delete buttons that appear on hover */}
          {isHovered && !isEditing && (
            <div
              className="absolute -right-2 -top-[50%] flex rounded-lg"
              style={{
                background: colors['bg-secondary'],
                border: `1px solid ${colors['border-primary']}`,
                boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
              }}
            >
              <button
                onClick={() => setIsEditing(true)}
                onMouseEnter={() => setIsEditButtonHovered(true)}
                onMouseLeave={() => setIsEditButtonHovered(false)}
                className="flex items-center justify-center p-2 transition-colors duration-200"
                style={{
                  borderRight: `1px solid ${colors['border-primary']}`,
                  borderTopLeftRadius: '8px',
                  borderBottomLeftRadius: '8px',
                  background: isEditButtonHovered
                    ? colors['bg-tertiary']
                    : colors['bg-secondary'],
                }}
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                  alt="Edit"
                  className="w-3 h-3"
                />
              </button>
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  onMouseEnter={() => setIsDeleteButtonHovered(true)}
                  onMouseLeave={() => setIsDeleteButtonHovered(false)}
                  className="flex items-center justify-center p-2 transition-colors duration-200"
                  style={{
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px',
                    background: isDeleteButtonHovered
                      ? colors['bg-tertiary']
                      : colors['bg-secondary'],
                  }}
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                    alt="Delete"
                    className="w-3 h-3"
                  />
                </button>
              )}
            </div>
          )}
        </div>
      )}

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
