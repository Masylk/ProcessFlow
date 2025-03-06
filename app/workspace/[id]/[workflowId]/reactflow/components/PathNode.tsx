import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';

function PathNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  return (
    <>
      <div
        className="transition-all duration-300 relative"
        style={{
          width: '32px',
          height: '32px',
        }}
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
            background: '#2563EB',
            transform: 'rotate(45deg)',
          }}
        >
          <span
            className="text-white text-xl leading-none"
            style={{ transform: 'rotate(-45deg)' }}
          >
            +
          </span>
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
    </>
  );
}

export default PathNode;
