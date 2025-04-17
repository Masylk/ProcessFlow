import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../../types';
import AddChildPathModal from '../modals/AddChildPathModal';
import { createChildPaths } from '../../utils/createChildPaths';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { useColors } from '@/app/theme/hooks';
import { BasicBlock } from './BasicBlock';

function PathNode(props: NodeProps & { data: NodeData }) {
  const { id, data, selected } = props;
  const [showModal, setShowModal] = useState(false);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const colors = useColors();

  // Find the path block to get the count of existing child paths
  const pathBlock = data.path?.blocks.find(
    (block: { id: number }) => block.id === parseInt(id.replace('block-', ''))
  );

  const existingPathsCount = pathBlock?.child_paths?.length || 0;
  // Get the names and IDs of existing child paths
  const existingPaths =
    pathBlock?.child_paths?.map((cp) => ({
      id: cp.path.id,
      name: cp.path.name,
    })) || [];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCreateChildPaths = async (pathNames: string[]) => {
    try {
      setShowModal(false);

      if (!data.path?.workflow_id || !data.path) {
        throw new Error('Path data is missing');
      }

      // If we have existing paths, handle updates and deletions
      if (existingPaths.length > 0) {
        // Find paths to update and paths to delete
        const pathsToUpdate = existingPaths.filter(
          (_, index) => index < pathNames.length
        );
        const pathsToDelete = existingPaths.filter(
          (_, index) => index >= pathNames.length
        );

        // Delete removed paths
        await Promise.all(
          pathsToDelete.map(async (path) => {
            await fetch(`/api/paths/${path.id}`, {
              method: 'DELETE',
            });
          })
        );

        // Update remaining paths
        await Promise.all(
          pathsToUpdate.map(async (path, index) => {
            await fetch(`/api/paths/${path.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: pathNames[index] }),
            });
          })
        );

        // If we have more new paths than existing ones, create the additional paths
        if (pathNames.length > existingPaths.length) {
          const newPathNames = pathNames.slice(existingPaths.length);
          const result = await createChildPaths(
            newPathNames,
            data.path.workflow_id,
            data.path
          );
          data.onPathsUpdate?.(result.paths);
        } else {
          // Just fetch the updated paths to refresh the UI
          const pathsResponse = await fetch(
            `/api/workspace/${data.path.workflow_id}/paths?workflow_id=${data.path.workflow_id}`
          );
          if (pathsResponse.ok) {
            const pathsData = await pathsResponse.json();
            data.onPathsUpdate?.(pathsData.paths);
          }
        }
      } else {
        // If no existing paths, create all new ones
        const result = await createChildPaths(
          pathNames,
          data.path.workflow_id,
          data.path
        );
        data.onPathsUpdate?.(result.paths);
      }
    } catch (error) {
      console.error('Error managing child paths:', error);
    }
  };

  return (
    <BasicBlock {...props}>
      <div
        className={`transition-opacity duration-300 ${isConnectMode || isEditMode ? 'opacity-40' : 'hover:opacity-80'}`}
      >
        <div
          className="transition-all duration-300 relative cursor-pointer"
          style={{
            width: '32px',
            height: '32px',
          }}
          onClick={handleClick}
        >
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            style={{
              width: 6,
              height: 6,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: colors['utility-brand-500'],
              transform: 'rotate(45deg)',
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-white.svg`}
              alt="Add path"
              className="w-6 h-6"
              style={{ transform: 'rotate(-45deg)' }}
            />
          </div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            style={{
              width: 6,
              height: 6,
              opacity: 0,
              background: colors['utility-brand-500'],
              border: '2px solid white',
              pointerEvents: 'none',
            }}
          />
        </div>

        {showModal && (
          <AddChildPathModal
            onClose={() => setShowModal(false)}
            onConfirm={handleCreateChildPaths}
            existingPathsCount={existingPathsCount}
            existingPaths={existingPaths.map((p) => p.name)}
          />
        )}
      </div>
    </BasicBlock>
  );
}

export default PathNode;
