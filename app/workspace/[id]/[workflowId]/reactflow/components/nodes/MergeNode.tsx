import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../types';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
interface MergeNodeProps extends NodeProps {
  data: NodeData;
  id: string;
}

function MergeNode({ id, data }: MergeNodeProps) {
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  return (
    <div
      className={`transition-opacity duration-300 ${isConnectMode || isEditMode ? 'opacity-50' : 'opacity-100'}`}
    >
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        style={{
          background: '#b1b1b7',
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />
      <div className="w-1 h-1 rounded-full bg-[#b1b1b7]" />
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        style={{
          background: '#b1b1b7',
          width: 1,
          height: 1,
          opacity: 0,
        }}
      />
    </div>
  );
}

export default MergeNode;
