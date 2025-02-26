import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';

function CustomNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  return (
    <>
      {/* This is the main node container div */}
      <div
        style={{
          width: '481px',
          padding: '20px 24px',
          borderRadius: '16px',
          border: '2px solid red', // Currently red for debugging
          background: 'white',
          minHeight: '120px',
          position: 'relative',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            width: 10,
            height: 10,
            background: '#b1b1b7',
            border: '2px solid white',
            opacity: 1,
          }}
        />
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-500">
              Position: {data.position}
            </div>
            <div className="text-xs text-blue-500">
              Type: {data.type || 'STEP'}
            </div>
          </div>
          <button
            onClick={() => data.onDelete?.(id)}
            className="text-gray-400 hover:text-red-500"
          >
            ×
          </button>
        </div>
        <div className="text-gray-900">{data.label}</div>
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{
            width: 10,
            height: 10,
            background: '#b1b1b7',
            border: '2px solid white',
            opacity: 1,
          }}
        />
      </div>
      {data.isLastInPath && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            height: '40px',
            background: '#d0d5dd',
            cursor: 'pointer',
          }}
        >
          <div
            className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center text-xl absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            onClick={(e) => {
              const lastPosition = data.position + 1;
              data.handleAddBlockOnEdge?.(lastPosition, data.pathId ?? null, e);
            }}
          >
            +
          </div>
        </div>
      )}
    </>
  );
}

export default CustomNode;
