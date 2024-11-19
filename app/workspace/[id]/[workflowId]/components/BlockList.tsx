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

interface BlockPosition {
  x: number;
  y: number;
}

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
  const { transformState } = useTransformContext();

  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [blockPositions, setBlockPositions] = useState<
    Record<number, BlockPosition>
  >({});

  // Update each block's position in the transformWrapper based on transformState
  useEffect(() => {
    const updateBlockPositions = () => {
      const newPositions = blocks.reduce((positions, block) => {
        const element = document.getElementById(`editor-block-${block.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Calculate adjusted position based on zoom and pan offset
          positions[block.id] = {
            x: (rect.left - transformState.positionX) / transformState.scale,
            y: (rect.top - transformState.positionY) / transformState.scale,
          };
        }
        return positions;
      }, {} as Record<number, BlockPosition>);
      setBlockPositions(newPositions);
    };

    updateBlockPositions();
    console.log('updating positions');

    // Recalculate positions when transformState changes
    // You can debounce this if performance becomes an issue
  }, [blocks, transformState]);

  useEffect(() => {
    console.log(transformState);
  }, [transformState]);

  useEffect(() => {
    setBlockList(blocks);
  }, [blocks]);

  useEffect(() => {
    const fetchPaths = async (pathBlockId: number, blockId: number) => {
      try {
        const response = await fetch(`/api/blocks/${pathBlockId}/paths`);
        if (response.ok) {
          const paths: PathType[] = await response.json();
          console.log('subpathcreation ', pathBlockId);
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
      onBlocksReorder(reorderedBlocks);
    } catch (error) {
      console.error('Failed to update block order:', error);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    // Include scroll position offsets
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (isDragging) {
      // Adjust the offsets according to zoom level
      let baseOffsetX = 70;
      let baseOffsetY = 180;

      // Apply zoom scaling to the offsets
      const offsetX = baseOffsetX;
      const offsetY = baseOffsetY;

      const adjustedX =
        (event.clientX + scrollX - transformState.positionX - offsetX) /
        transformState.scale;
      const adjustedY =
        (event.clientY + scrollY - transformState.positionY - offsetY) /
        transformState.scale;

      setMousePosition({ x: adjustedX, y: adjustedY });
    }
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging]);

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
              className={`flex flex-col w-96 items-center ${
                draggingBlockId === block.id ? draggingClass : ''
              }`}
            >
              <EditorBlock
                id={`editor-block-${block.id}`} // Add unique id here
                block={block}
                handleAddBlockFn={handleAddBlockFn}
                handleDeleteBlockFn={handleDeleteBlockFn}
                copyBlockFn={copyBlockFn}
                onClick={handleClick}
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
                      handleAddBlock={handleAddBlock} // Passing handleAddBlock to Path
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

  const handleClick = (block: Block, event: React.MouseEvent) => {
    // event.stopPropagation();
    setPathFn(pathId, block.position, handleAddBlockFn);
    handleBlockClick(block);
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <StrictModeDroppable droppableId="blocks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex justify-center overflow-hidden w-full"
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
            {/* Div that follows the mouse on Drag and Drop*/}
            <div
              style={{
                position: 'absolute',
                left: mousePosition.x + 10,
                top: mousePosition.y + 10,
                backgroundColor: 'rgba(200, 200, 200, 0.8)',
                padding: '8px',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                pointerEvents: 'none', // Prevent blocking mouse events
                opacity: isDragging ? 1 : 0, // Control visibility
                transition: 'opacity 0.2s ease', // Smooth transition
              }}
            >
              <p>Dragging a block...</p>
            </div>
          </div>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
};

export default BlockList;
