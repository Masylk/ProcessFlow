import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../types';
import { BlockEndType } from '@/types/block';
import { useConnectModeStore } from '../../store/connectModeStore';

function EndNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);

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
    <div
      className={`transition-opacity duration-300 ${isConnectMode ? 'opacity-40' : ''}`}
    >
      <div
        className={`transition-all duration-300 flex items-center gap-3 w-fit text-sm`}
        style={{
          height: '48px',
          width: '290px',
          padding: '12px 18px',
          borderRadius: '9999px',
          background: '#FECDCA',
          position: 'relative',
          border: '1px solid #B42318',
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
            pointerEvents: 'none',
          }}
        />
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/stop-circle-icon.svg`}
          alt="Stop"
          className="w-4 h-4 text-[#B42318]"
        />
        <div className="text-[#B42318] font-medium">
          This is where your process ends
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
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
}

export default EndNode;
