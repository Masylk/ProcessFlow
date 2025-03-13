import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../types';
import { useConnectModeStore } from '../store/connectModeStore';

interface MergeNodeProps extends NodeProps {
  data: NodeData;
}

function MergeNode({ data }: MergeNodeProps) {
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);

  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-300 transition-opacity duration-300 ${
        isConnectMode ? 'opacity-40' : ''
      }`}
      style={{
        width: '150px',
        textAlign: 'center',
      }}
    >
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        style={{ background: '#b1b1b7' }}
      />
      <div className="font-bold text-sm text-gray-700">Merge</div>
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        style={{ background: '#b1b1b7' }}
      />
    </div>
  );
}

export default MergeNode;
