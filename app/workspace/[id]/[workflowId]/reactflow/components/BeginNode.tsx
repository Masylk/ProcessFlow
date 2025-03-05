import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';

function BeginNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  return (
    <>
      <div
        className={`transition-all duration-300 flex items-center justify-center`}
        style={{
          width: '200px',
          height: '50px',
          padding: '12px 16px',
          borderRadius: '8px',
          border: selected ? '2px solid #60a5fa' : '2px solid #93c5fd',
          background: '#eff6ff',
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
            background: '#60a5fa',
            border: '2px solid white',
          }}
        />

        <div className="text-blue-600 font-medium truncate">
          {data.pathName || 'Path'}
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
      </div>
    </>
  );
}

export default BeginNode;
