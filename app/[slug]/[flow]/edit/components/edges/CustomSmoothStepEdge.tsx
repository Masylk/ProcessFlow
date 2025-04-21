import React, { useState } from 'react';
import { EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { EdgeData } from '../../../types';
import { BlockEndType } from '@/types/block';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import DeleteBlocksModal from '../modals/DeleteBlocksModal';
import { usePathsStore } from '../../store/pathsStore';
import { useColors, useThemeAssets } from '@/app/theme/hooks';
import { BasicEdge } from './BasicEdge';

// Helper function to check if we're in non-production environment
const isNonProduction = () => process.env.NODE_ENV !== 'production';

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

      if (!sourceBlock || !targetBlock) {
        if (isNonProduction()) {
          console.log('sourceBlock or targetBlock is undefined');
        }
        return;
      }
      if (isNonProduction()) {
        console.log('sourceBlock and targetBlock are defined');
      }
      const position = Math.ceil(
        (sourceBlock.position + targetBlock.position) / 2
      );
      console.log('position', position);
      const blocksToDelete = path.blocks
        .filter((b) => b.position >= position)
        .map((b) => b.id);

      if (blocksToDelete.length === 0) return;

      console.log('blocksToDelete', blocksToDelete);
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

      const pathsResponse = await fetch(
        `/api/workspace/${data.workspaceId}/paths?workflow_id=${data.path.workflow_id}`
      );
      const updatedPathsData = await pathsResponse.json();
      // Update positions of remaining blocks
      // const updatedPaths = allPaths.map((p) => {
      //   if (p.id === data.path.id) {
      //     const updatedBlocks = p.blocks
      //       .filter((b) => !blocksToDelete.includes(b.id))
      //       .map((b, index) => ({
      //         ...b,
      //         position: index,
      //       }));
      //     return { ...p, blocks: updatedBlocks };
      //   }
      //   return p;
      // });

      setAllPaths(updatedPathsData.paths);
      data.onPathsUpdate?.(updatedPathsData.paths);
    } catch (error) {
      console.error('Error deleting blocks:', error);
    }
  };

  return (
    <BasicEdge
      id={id}
      source={source}
      target={target}
      sourceX={sourceX}
      sourceY={sourceY}
      targetX={targetX}
      targetY={targetY}
      sourcePosition={sourcePosition}
      targetPosition={targetPosition}
      style={style}
      data={data}
    >
      <path
        id={id}
        className={`react-flow__edge-path ${
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
                borderColor: colors['border-secondary'],
              }}
              className="flex rounded-lg overflow-hidden border"
            >
              <button
                onClick={handleEdgeClick}
                style={
                  {
                    '--hover-bg': colors['bg-secondary'],
                    borderRight: `1px solid ${colors['border-secondary']}`,
                  } as React.CSSProperties
                }
                className="flex items-center justify-center p-2 hover:bg-[var(--hover-bg)]"
              >
                <img
                  src={
                    assets.icons['plus'] ||
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-circle.svg`
                  }
                  alt="Add"
                  style={{ stroke: colors['icon-secondary'] }}
                  className="w-3 h-3"
                />
              </button>
              <button
                style={
                  {
                    '--hover-bg': colors['bg-secondary'],
                  } as React.CSSProperties
                }
                className="flex items-center justify-center p-2 hover:bg-[var(--hover-bg)]"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
              >
                <img
                  src={
                    assets.icons['trash'] ||
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`
                  }
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
    </BasicEdge>
  );
}

export default CustomSmoothStepEdge;
