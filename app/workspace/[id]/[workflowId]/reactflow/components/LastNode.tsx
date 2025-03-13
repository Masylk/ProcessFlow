import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';
import { useConnectModeStore } from '../store/connectModeStore';

function LastNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.handleAddBlockOnEdge && data.path) {
      data.handleAddBlockOnEdge(data.position, data.path, e);
    }
  };

  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);

  return (
    <div className={`transition-opacity duration-300 ${isConnectMode ? 'opacity-40' : ''}`}>
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
        }}
      />
      <button
        onClick={handleClick}
        className="w-8 h-8 bg-white border-2 border-blue-400 text-blue-500 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon.svg`}
          alt="Add"
          className="w-6 h-6"
        />
      </button>
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
        }}
      />
    </div>
  );
}

export default LastNode;
