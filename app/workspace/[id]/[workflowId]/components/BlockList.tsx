import React, { useEffect, useState } from 'react';
import { Block } from '@/types/block';
import EditorBlock from './EditorBlock';
import AddBlock from './AddBlock';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '@/app/components/StrictModeDroppable';
import { Path as PathType } from '@/types/path';
import Path from './Path';

interface BlockListProps {
  blocks: Block[];
  workspaceId: number;
  pathId: number;
  onBlockClick: (block: Block) => void;
  onAddBlockClick: (position: number) => void;
  onBlocksReorder: (reorderedBlocks: Block[]) => void;
}

const BlockList: React.FC<BlockListProps> = ({
  blocks,
  workspaceId,
  pathId,
  onBlockClick,
  onAddBlockClick,
  onBlocksReorder,
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

  const handleDragEnd = async (result: DropResult) => {
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
      console.log(paths, block.type, block.description);
      return (
        <Draggable
          key={block.id}
          draggableId={block.id.toString()}
          index={index}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="flex flex-col w-full"
            >
              <EditorBlock block={block} onClick={onBlockClick} />
              {paths && (
                <div className="flex flex-wrap items-center gap-2 mt-2 w-full">
                  {paths.map((path, key) => (
                    <Path
                      key={`${block.id}-path-${key}`}
                      pathId={path.id}
                      workspaceId={workspaceId}
                      workflowId={block.workflowId}
                    />
                  ))}
                  <AddBlock
                    id={index + 1}
                    onAdd={() => onAddBlockClick(index + 1)}
                    label="Add Block"
                  />
                </div>
              )}
              {block.type !== 'PATH' && (
                <AddBlock
                  id={index + 1}
                  onAdd={() => onAddBlockClick(index + 1)}
                  label="Add Block"
                />
              )}
            </div>
          )}
        </Draggable>
      );
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <StrictModeDroppable droppableId="blocks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4 w-full"
          >
            {renderBlocksWithOptions(blockList)}
            {provided.placeholder}
            {blockList.length === 0 && (
              <div>
                <AddBlock id={0} onAdd={onAddBlockClick} label="Add Block" />
              </div>
            )}
          </div>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
};

export default BlockList;
