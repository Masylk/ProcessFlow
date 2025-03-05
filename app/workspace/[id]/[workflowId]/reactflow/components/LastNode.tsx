import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';

function LastNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.handleAddBlockOnEdge && data.path) {
      data.handleAddBlockOnEdge(data.position, data.path, e);
    }
  };

  return (
    <>
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
      <button
        onClick={handleClick}
        className="w-8 h-8 bg-white text-blue-500 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center text-xl"
      >
        +
      </button>
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
    </>
  );
}

export default LastNode;
