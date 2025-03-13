import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';
import AddChildPathModal from './AddChildPathModal';
import { createChildPaths } from '../utils/createChildPaths';
import { useConnectModeStore } from '../store/connectModeStore';

function PathNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const [showModal, setShowModal] = useState(false);
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);

  // Find the path block to get the count of existing child paths
  const pathBlock = data.path?.blocks.find(
    (block: { id: number }) => block.id === parseInt(id.replace('block-', ''))
  );

  const existingPathsCount = pathBlock?.child_paths?.length || 0;

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

      const result = await createChildPaths(
        pathNames,
        data.path.workflow_id,
        data.path
      );

      data.onPathsUpdate?.(result.paths);
    } catch (error) {
      console.error('Error creating child paths:', error);
    }
  };

  return (
    <div className={`transition-opacity duration-300 ${isConnectMode ? 'opacity-40' : ''}`}>
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
            background: '#60a5fa',
            border: '2px solid white',
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            background: '#4E6BD7',
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
            background: '#60a5fa',
            border: '2px solid white',
          }}
        />
      </div>

      {showModal && (
        <AddChildPathModal
          onClose={() => setShowModal(false)}
          onConfirm={handleCreateChildPaths}
          existingPathsCount={existingPathsCount}
        />
      )}
    </div>
  );
}

export default PathNode;
