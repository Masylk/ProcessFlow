import React, { useEffect, useState } from 'react';
import { Block } from '@/types/block';
import EditorBlock from './EditorBlock';
import AddBlock from './AddBlock';
import {
  DragDropContext,
  Draggable,
  DropResult,
  DragStart,
} from 'react-beautiful-dnd';
import { StrictModeDroppable } from '@/app/components/StrictModeDroppable';
import { Path as PathType } from '@/types/path';
import Path from './Path'; // Ensure Path is imported

interface BlockListProps {
  blocks: Block[];
  workspaceId: number;
  pathId: number;
  onBlockClick: (
    block: Block,
    updateBlockFn: (updatedBlock: Block) => Promise<void>,
    deleteBlockFn: (blockId: number) => Promise<void>
  ) => void;
  onAddBlockClick: (position: number) => void;
  onBlocksReorder: (reorderedBlocks: Block[]) => void;
  handleBlockClick: (block: Block) => void;
  closeDetailSidebar: () => void;
  handleAddBlock: (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => void;
  disableZoom: (isDisabled: boolean) => void; // New prop to control zoom/pan
}

const BlockList: React.FC<BlockListProps> = ({
  blocks,
  workspaceId,
  pathId,
  onBlockClick,
  onAddBlockClick,
  onBlocksReorder,
  handleBlockClick,
  closeDetailSidebar,
  handleAddBlock,
  disableZoom, // Added here
}) => {
  const [blockList, setBlockList] = useState<Block[]>(blocks);
  const [pathsByBlockId, setPathsByBlockId] = useState<
    Record<number, PathType[]>
  >({});

  useEffect(() => {
    setBlockList(blocks); // Sync local state with props when blocks change
  }, [blocks]);

  useEffect(() => {
    const fetchPaths = async (blockId: number) => {
      try {
        const response = await fetch(`/api/blocks/${blockId}/paths`);
        if (response.ok) {
          const paths: PathType[] = await response.json();
          setPathsByBlockId((prev) => ({
            ...prev,
            [blockId]: paths,
          }));
        } else {
          console.error(`Failed to fetch paths for block ${blockId}`);
        }
      } catch (error) {
        console.error(`Error fetching paths for block ${blockId}:`, error);
      }
    };

    blockList.forEach((block) => {
      if (block.type === 'PATH' && block.pathBlock) {
        fetchPaths(block.pathBlock?.id);
      }
    });
  }, [blockList]);

  const handleDragStart = (start: DragStart) => {
    // Disable zoom when drag starts
    disableZoom(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    // Enable zoom when drag ends
    disableZoom(false);

    if (!result.destination) return;

    const reorderedBlocks = Array.from(blockList);
    const [reorderedItem] = reorderedBlocks.splice(result.source.index, 1);
    reorderedBlocks.splice(result.destination.index, 0, reorderedItem);

    // Update local state with the new order
    setBlockList(reorderedBlocks);

    try {
      // Send the reordered list to the parent component to update the database
      onBlocksReorder(reorderedBlocks);
    } catch (error) {
      console.error('Failed to update block order:', error);
    }
  };

  const renderBlocksWithOptions = (blocks: Block[]) => {
    return blocks.map((block, index) => {
      const paths = block.pathBlock ? pathsByBlockId[block.pathBlock?.id] : [];
      return (
        <Draggable
          key={block.id}
          draggableId={block.id.toString()}
          index={index}
        >
          {(provided) => {
            return (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="flex flex-col w-full"
              >
                <EditorBlock block={block} onClick={handleClick} />
                {paths && (
                  <div className="flex flex-row items-center gap-2 mt-2 w-full">
                    {paths.map((path, key) => (
                      <Path
                        key={`${block.id}-path-${key}`}
                        pathId={path.id}
                        workspaceId={workspaceId}
                        workflowId={block.workflowId}
                        onBlockClick={onBlockClick}
                        closeDetailSidebar={closeDetailSidebar}
                        handleAddBlock={handleAddBlock}
                        disableZoom={disableZoom} // Pass disableZoom here
                      />
                    ))}
                  </div>
                )}
                <AddBlock
                  id={index + 1}
                  onAdd={() => onAddBlockClick(index + 1)}
                  label="Add Block"
                />
              </div>
            );
          }}
        </Draggable>
      );
    });
  };

  const handleClick = (block: Block, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents the click from bubbling up
    handleBlockClick(block);
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <StrictModeDroppable droppableId="blocks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex justify-center h-full w-full"
          >
            <div className="w-full max-w-md">
              {renderBlocksWithOptions(blockList)}
              <div>{provided.placeholder}</div>
              {blockList.length === 0 && (
                <div>
                  <AddBlock
                    id={0}
                    onAdd={() => onAddBlockClick(0)}
                    label="Add Block"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
};

export default BlockList;
