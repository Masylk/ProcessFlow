import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { NodeData } from '../../../types';
import { BlockEndType } from '@/types/block';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import { useColors } from '@/app/theme/hooks';
import DynamicIcon from '@/utils/DynamicIcon';
import { BasicBlock } from './BasicBlock';
import { usePathsStore } from '../../store/pathsStore';

function EndBlock(props: NodeProps & { data: NodeData }) {
  const { id, data, selected } = props;
  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const colors = useColors();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteButtonHovered, setIsDeleteButtonHovered] = useState(false);
  const setPaths = usePathsStore((state) => state.setPaths);

  const handleConvertToLast = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Optimistically update to LAST
    setPaths((currentPaths) => {
      const updatedPaths = currentPaths.map((path) =>
        path.id === data.path?.id
          ? {
              ...path,
              blocks: path.blocks.map((b) =>
                b.id === data.block.id ? { ...b, type: BlockEndType.LAST } : b
              ),
            }
          : path
      );
      if (typeof data.onPathsUpdate === 'function') {
        data.onPathsUpdate(updatedPaths);
      }
      return updatedPaths;
    });
    try {
      await fetch(`/api/blocks/${id.replace('block-', '')}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: BlockEndType.LAST,
        }),
      });
    } catch (error) {
      // Rollback to END if error
      setPaths((currentPaths) => {
        const rolledBackPaths = currentPaths.map((path) =>
          path.id === data.path?.id
            ? {
                ...path,
                blocks: path.blocks.map((b) =>
                  b.id === data.block.id ? { ...b, type: BlockEndType.END } : b
                ),
              }
            : path
        );
        if (typeof data.onPathsUpdate === 'function') {
          data.onPathsUpdate(rolledBackPaths);
        }
        return rolledBackPaths;
      });
      console.error('Error converting to LAST:', error);
    }
  };

  return (
    <BasicBlock {...props}>
      <div
        className={`transition-opacity duration-300 relative ${isConnectMode || isEditMode ? 'opacity-40' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div
            className="absolute -right-1 -top-[40%] flex rounded-lg z-10"
            style={{
              background: colors['bg-secondary'],
              border: `1px solid ${colors['border-primary']}`,
              boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.05)',
            }}
          >
            <button
              onClick={handleConvertToLast}
              onMouseEnter={() => setIsDeleteButtonHovered(true)}
              onMouseLeave={() => setIsDeleteButtonHovered(false)}
              className="flex items-center justify-center p-2 transition-colors duration-200"
              style={{
                borderRadius: '8px',
                background: isDeleteButtonHovered
                  ? colors['bg-tertiary']
                  : colors['bg-secondary'],
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                alt="Delete"
                className="w-3 h-3"
              />
            </button>
          </div>
        )}

        <div
          className={`transition-all duration-300 flex items-center gap-3 w-fit text-sm relative`}
          style={{
            height: '48px',
            width: '290px',
            padding: '12px 18px',
            borderRadius: '9999px',
            background: colors['utility-error-100'],
            border: `1px solid ${colors['utility-error-200']}`,
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
          <DynamicIcon
            url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/stop-circle-icon.svg`}
            size={16}
            color={colors['utility-error-700']}
            className="w-4 h-4"
          />
          <div
            style={{ color: colors['utility-error-700'] }}
            className="text-sm font-normal flex-1"
          >
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
    </BasicBlock>
  );
}

export default EndBlock;
