import React, { useState } from 'react';
import { EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { EdgeData } from '../../types';
import { BlockEndType } from '@/types/block';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import DeleteBlocksModal from '../modals/DeleteBlocksModal';
import { usePathsStore } from '../../store/pathsStore';
import { useColors, useThemeAssets } from '@/app/theme/hooks';

function CustomSmoothStepEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps & { data: EdgeData }) {
  const colors = useColors();
  const assets = useThemeAssets();

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 16,
  });

  const sourceBlock = data.blocks.find((b) => `block-${b.id}` === source);
  const targetBlock = data.blocks.find((b) => `block-${b.id}` === target);
  const isLastTypeInvolved =
    sourceBlock?.type === BlockEndType.LAST ||
    targetBlock?.type === BlockEndType.LAST;

  const handleEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sourceBlock && targetBlock) {
      const position = Math.ceil(
        (sourceBlock.position + targetBlock.position) / 2
      );
      data.handleAddBlockOnEdge?.(position, data.path, e);
    }
  };

  const isConnectMode = useConnectModeStore((state) => state.isConnectMode);
  const isEditMode = useEditModeStore((state) => state.isEditMode);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const allPaths = usePathsStore((state) => state.paths);
  const setAllPaths = usePathsStore((state) => state.setPaths);

  const handleDeleteBlocks = async () => {
    try {
      // Get all blocks after this position except the last one
      const path = allPaths.find((p) => p.id === data.path.id);
      if (!path) return;
      console.log('allPaths', allPaths);

      if (!sourceBlock || !targetBlock) {
        console.log('sourceBlock or targetBlock is undefined');
        return;
      }
      console.log('sourceBlock and targetBlock are defined');
      const position = Math.ceil(
        (sourceBlock.position + targetBlock.position) / 2
      );
      const blocksToDelete = path.blocks
        .filter(
          (b) => b.position >= position && b.position < path.blocks.length - 1
        )
        .map((b) => b.id);

      if (blocksToDelete.length === 0) return;

      const response = await fetch('/api/blocks/delete-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockIds: blocksToDelete,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete blocks');
      }

      // Update positions of remaining blocks
      const updatedPaths = allPaths.map((p) => {
        if (p.id === data.path.id) {
          const updatedBlocks = p.blocks
            .filter((b) => !blocksToDelete.includes(b.id))
            .map((b, index) => ({
              ...b,
              position: index,
            }));
          return { ...p, blocks: updatedBlocks };
        }
        return p;
      });

      setAllPaths(updatedPaths);
      data.onPathsUpdate?.(updatedPaths);
    } catch (error) {
      console.error('Error deleting blocks:', error);
    }
  };

  return (
    <>
      <path
        id={id}
        className={`react-flow__edge-path transition-opacity duration-300 ${
          isConnectMode || isEditMode ? 'opacity-40' : ''
        }`}
        d={edgePath}
        style={{
          strokeWidth: 2,
          stroke: colors['border'],
          ...style,
        }}
      />
      <path
        d={edgePath}
        fill="none"
        strokeWidth="20"
        stroke="transparent"
        onClick={handleEdgeClick}
        style={{ cursor: 'pointer' }}
      />
      {!isLastTypeInvolved && !isConnectMode && !isEditMode && (
        <foreignObject
          width={100}
          height={40}
          x={(sourceX + targetX) / 2 - 50}
          y={(sourceY + targetY) / 2 - 20}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="flex items-center justify-center w-full h-full">
            <div 
              style={{ 
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-secondary']
              }}
              className="flex rounded-lg overflow-hidden border shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05),inset_0px_-2px_0px_0px_rgba(16,24,40,0.05),inset_0px_0px_0px_1px_rgba(16,24,40,0.18)]"
            >
              <button
                onClick={handleEdgeClick}
                style={{ 
                  '--hover-bg': colors['bg-secondary'],
                  borderRight: `1px solid ${colors['border-secondary']}`
                } as React.CSSProperties}
                className="flex items-center justify-center p-2 hover:bg-[var(--hover-bg)]"
              >
                <img 
                  src={assets.icons['plus'] || `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-circle.svg`} 
                  alt="Add" 
                  style={{ stroke: colors['icon-secondary'] }}
                  className="w-3 h-3" 
                />
              </button>
              <button
                style={{ 
                  '--hover-bg': colors['bg-secondary']
                } as React.CSSProperties}
                className="flex items-center justify-center p-2 hover:bg-[var(--hover-bg)]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
              >
                <img 
                  src={assets.icons['trash'] || `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`} 
                  alt="Delete" 
                  style={{ stroke: colors['icon-secondary'] }}
                  className="w-3 h-3" 
                />
              </button>
            </div>
          </div>
        </foreignObject>
      )}
      {showDeleteModal && (
        <DeleteBlocksModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteBlocks}
        />
      )}
    </>
  );
}

export default CustomSmoothStepEdge;
