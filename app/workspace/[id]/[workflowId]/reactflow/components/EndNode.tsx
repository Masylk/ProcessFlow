import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';

function EndNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  return (
    <>
      <div
        className={`transition-all duration-300`}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#1f2937',
          border: selected ? '2px solid #60a5fa' : '2px solid #1f2937',
          position: 'relative',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            width: 8,
            height: 8,
            background: '#1f2937',
            border: '2px solid white',
            top: -6,
          }}
        />
      </div>
    </>
  );
}

export default EndNode; 