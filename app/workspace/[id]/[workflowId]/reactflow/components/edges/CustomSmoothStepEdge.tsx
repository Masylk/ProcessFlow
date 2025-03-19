import React, { useState } from 'react';
import { EdgeProps, getSmoothStepPath } from '@xyflow/react';
import { EdgeData } from '../../types';
import { BlockEndType } from '@/types/block';
import { useConnectModeStore } from '../../store/connectModeStore';
import { useEditModeStore } from '../../store/editModeStore';
import DeleteBlocksModal from '../modals/DeleteBlocksModal';
import { usePathsStore } from '../../store/pathsStore';

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
          stroke: '#b1b1b7',
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
          width={40}
          height={40}
          x={(sourceX + targetX) / 2 - 20}
          y={(sourceY + targetY) / 2 - 20}
          className="edgebutton-foreignobject"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="flex items-center justify-center w-full h-full">
            <button
              onClick={handleEdgeClick}
              className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center text-xl"
            >
              +
            </button>
            <button
              className="w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
                alt="Delete"
                className="w-3 h-3"
              />
            </button>
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
