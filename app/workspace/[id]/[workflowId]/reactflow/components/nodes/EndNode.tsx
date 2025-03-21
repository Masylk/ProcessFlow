import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../types';
import { BlockEndType } from '@/types/block';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';

function EndNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
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
      className={`transition-opacity duration-300 relative ${isConnectMode || isEditMode ? 'opacity-40' : ''}`}
    >
      <button
        onClick={handleConvertToLast}
        className="absolute -top-8 right-0 px-2 py-1 text-xs bg-white text-[#B42318] rounded-md hover:bg-red-50 transition-colors border border-[#B42318]"
      >
        Revert end block
      </button>

      <div
        className={`transition-all duration-300 flex items-center gap-3 w-fit text-sm relative`}
        style={{
          height: '48px',
          width: '290px',
          padding: '12px 18px',
          borderRadius: '9999px',
          background: '#FECDCA',
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
        <div className="text-[#B42318] font-medium flex-1">
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
