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
import Path from './Path';
import { useTransformContext } from 'react-zoom-pan-pinch';
import { CanvasEvent, CanvasEventType } from '../page';
import ImageOverlay from './ImageOverlay';

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
  onBlocksReorder: (reorderedBlocks: Block[]) => Promise<void>;
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
  handleAddBlockFn: (
    blockData: any,
    pathId: number,
    position: number
  ) => Promise<void>;
  handleDeleteBlockFn: (blockId: number) => Promise<void>;
  disableZoom: (isDisabled: boolean) => void;
  copyBlockFn: (blockdata: Block) => void;
  setPathFn: (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => void;
  setDefaultPathFn: (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => void;
  onCanvasEvent: (eventData: CanvasEvent) => void;
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
  handleAddBlockFn,
  handleDeleteBlockFn,
  disableZoom,
  copyBlockFn,
  setPathFn,
  setDefaultPathFn,
  onCanvasEvent,
}) => {
  const [blockList, setBlockList] = useState<Block[]>(blocks);
  const [pathsByBlockId, setPathsByBlockId] = useState<
    Record<number, PathType[]>
  >({});
  const [draggingBlockId, setDraggingBlockId] = useState<number | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<number | null>(null);
  const { transformState } = useTransformContext();

  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // New state for overlay visibility
  const [overlayVisible, setOverlayVisible] = useState(false);

  useEffect(() => {
    setBlockList(blocks);
  }, [blocks]);

  useEffect(() => {
    const fetchPaths = async (pathBlockId: number, blockId: number) => {
      try {
        const response = await fetch(`/api/blocks/${pathBlockId}/paths`);
        if (response.ok) {
          const paths: PathType[] = await response.json();

          onCanvasEvent({
            type: CanvasEventType.SUBPATH_CREATION,
            pathId: pathBlockId,
            blockId: blockId,
            subpaths: paths,
          });
          setPathsByBlockId((prev) => ({
            ...prev,
            [pathBlockId]: paths,
          }));
        } else {
          console.error(`Failed to fetch paths for block ${pathBlockId}`);
        }
      } catch (error) {
        console.error(`Error fetching paths for block ${pathBlockId}:`, error);
      }
    };

    blockList.forEach((block) => {
      if (
        block.type === 'PATH' &&
        block.pathBlock &&
        !(block.pathBlock.id in pathsByBlockId)
      ) {
        fetchPaths(block.pathBlock.id, block.id);
      }
    });
  }, [blockList, pathsByBlockId]);

  const handleClick = (block: Block, event: React.MouseEvent) => {
    setFocusedBlockId(block.id);
    setOverlayVisible(true); // Show overlay on block click
    setPathFn(pathId, block.position, handleAddBlockFn);
    handleBlockClick(block);
  };

  const handleOverlayClose = () => {
    setOverlayVisible(false); // Close overlay
  };

  const handleDragStart = (start: DragStart) => {
    setDraggingBlockId(Number(start.draggableId));
    setIsDragging(true);
    disableZoom(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    disableZoom(false);
    setDraggingBlockId(null);
    setIsDragging(false);
    setMousePosition({ x: 0, y: 0 });

    if (!result.destination) return;

    const reorderedBlocks = Array.from(blockList);
    const [reorderedItem] = reorderedBlocks.splice(result.source.index, 1);
    reorderedBlocks.splice(result.destination.index, 0, reorderedItem);
    setBlockList(reorderedBlocks);

    try {
      await onBlocksReorder(reorderedBlocks);
    } catch (error) {
      console.error('Failed to update block order:', error);
    }
  };

  const renderBlocksWithOptions = (blocks: Block[]) => {
    return blocks.map((block, index) => {
      const paths = block.pathBlock ? pathsByBlockId[block.pathBlock?.id] : [];
      const draggingClass =
        draggingBlockId === block.id ? 'invisible' : 'visible';

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
              className={`flex flex-col w-96 items-center ${draggingClass}`}
            >
              <EditorBlock
                block={block}
                handleAddBlockFn={handleAddBlockFn}
                handleDeleteBlockFn={handleDeleteBlockFn}
                copyBlockFn={copyBlockFn}
                onClick={handleClick}
                isFocused={focusedBlockId === block.id} // Check if this block is focused
              />

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
                      disableZoom={disableZoom}
                      copyBlockFn={copyBlockFn}
                      setPathFn={setPathFn}
                      setDefaultPathFn={setDefaultPathFn}
                      onCanvasEvent={onCanvasEvent}
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
          )}
        </Draggable>
      );
    });
  };

  return (
    <div>
      {overlayVisible && <ImageOverlay onClose={handleOverlayClose} />}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="blocks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex justify-center overflow-visible w-full"
            >
              <div>
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
    </div>
  );
};

export default BlockList;
