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
      className={`transition-opacity duration-300 ${isConnectMode ? 'opacity-40' : ''}`}
    >
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        style={{
          background: '#b1b1b7',
          width: 6,
          height: 6,
        }}
      />
      <div className="w-3 h-3 rounded-full bg-[#b1b1b7]" />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        style={{
          background: '#b1b1b7',
          width: 6,
          height: 6,
        }}
      />
    </div>
  );
}

export default MergeNode;
