import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../../types';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { useColors } from '@/app/theme/hooks';
import { BasicBlock } from './BasicBlock';

function LastNode(props: NodeProps & { data: NodeData }) {
  const { id, data, selected } = props;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.handleAddBlockOnEdge && data.path) {
      data.handleAddBlockOnEdge(data.position, data.path, e);
    }
  };

  const colors = useColors();
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  return (
    <BasicBlock {...props}>
      <div
        className={`transition-opacity duration-300 ${isConnectMode || isEditMode ? 'opacity-40' : ''}`}
      >
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            width: 8,
            height: 8,
            opacity: 0,
            background: colors['button-primary-bg'],
            border: `2px solid ${colors['base-white']}`,
            pointerEvents: 'none',
          }}
        />
        <button
          onClick={handleClick}
          className="w-8 h-8 border-2 rounded-full transition-colors flex items-center justify-center"
          style={{
            background: colors['bg-primary'],
            borderColor: colors['button-primary-bg'],
            color: colors['button-primary-bg'],
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = colors['bg-primary_hover'];
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = colors['bg-primary'];
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon.svg`}
            alt="Add"
            className="w-6 h-6"
          />
        </button>
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{
            width: 8,
            height: 8,
            opacity: 0,
            background: colors['button-primary-bg'],
            border: `2px solid ${colors['base-white']}`,
            pointerEvents: 'none',
          }}
        />
      </div>
    </BasicBlock>
  );
}

export default LastNode;
