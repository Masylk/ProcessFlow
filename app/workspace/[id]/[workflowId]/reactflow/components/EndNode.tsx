import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';
import { BlockEndType } from '@/types/block';

function EndNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const handleConvertToLast = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/blocks/${id.replace('block-', '')}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: BlockEndType.LAST,
        }),
      });

      // Fetch updated paths data
      const pathsResponse = await fetch(
        `/api/workspace/${data.path?.workflow_id}/paths?workflow_id=${data.path?.workflow_id}`
      );
      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        // Assuming onPathsUpdate is passed in data
        data.onPathsUpdate?.(pathsData.paths);
      }
    } catch (error) {
      console.error('Error converting to LAST:', error);
    }
  };

  return (
    <>
      <div
        className={`transition-all duration-300 flex items-center justify-center gap-2`}
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
          {'This is an end node'}
        </div>
        <button
          onClick={handleConvertToLast}
          className="w-6 h-6 bg-white text-blue-500 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center text-sm"
        >
          ↺
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
      </div>
    </>
  );
}

export default EndNode;
