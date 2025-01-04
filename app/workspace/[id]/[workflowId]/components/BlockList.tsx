import React, { useEffect, useState } from 'react';
import { Block, BlockType } from '@/types/block';
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
import VectorStraightSVG from '@/public/assets/workflow/vector-straight.svg';
import DelayBlock from './DelayBlock';
import PathBlock from './PathBlock';

interface BlockListProps {
  blocks: Block[];
  workspaceId: number;
  pathId: number;
  selectedBlock: Block | null;
  onBlockClick: (
    block: Block,
    updateBlockFn: (updatedBlock: Block) => Promise<void>,
    deleteBlockFn: (blockId: number) => Promise<void>
  ) => void;
  onAddBlockClick: (position: number, chosenType?: BlockType) => void;
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
    ) => Promise<Block | null>
  ) => void;
  handleAddBlockFn: (
    blockData: any,
    pathId: number,
    position: number
  ) => Promise<Block | null>;
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
    ) => Promise<Block | null>
  ) => void;
  setDefaultPathFn: (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<Block | null>
  ) => void;
  onCanvasEvent: (eventData: CanvasEvent) => void;
}

const VERTICAL_LINE_LENGTH = '50';

const BlockList: React.FC<BlockListProps> = ({
  blocks,
  workspaceId,
  pathId,
  selectedBlock,
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

  const [overlayVisible, setOverlayVisible] = useState(false);

  // New state to track hover for AddBlock component and SVG tags
  const [isHovered, setIsHovered] = useState(false);

  const updateBlockDelay = (blockId: string | number, newDelay: number) => {
    setBlockList((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId ? { ...block, delay: newDelay } : block
      )
    );
  };

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

  const handleClick = (block: Block) => {
    setFocusedBlockId(block.id);
    setOverlayVisible(true);
    setPathFn(pathId, block.position, handleAddBlockFn);
    handleBlockClick(block);
  };

  const handleOverlayClose = () => {
    setOverlayVisible(false);
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

  const handleMouseMove = (event: MouseEvent) => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    if (isDragging) {
      let baseOffsetX = 100;
      let baseOffsetY = 120;

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

      // Determine the next block or null if it's the last one
      const nextBlock = index < blocks.length - 1 ? blocks[index + 1] : null;

      return (
        <Draggable
          key={block.id}
          draggableId={block.id.toString()}
          index={index}
          isDragDisabled={!(selectedBlock === null)}
        >
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              className={`flex flex-col w-full items-center ${draggingClass}`}
            >
              <div {...provided.dragHandleProps} className="">
                {block.type === BlockType.STEP && (
                  <EditorBlock
                    block={block}
                    handleAddBlockFn={handleAddBlockFn}
                    handleDeleteBlockFn={handleDeleteBlockFn}
                    copyBlockFn={copyBlockFn}
                    onClick={handleClick}
                    isFocused={focusedBlockId === block.id}
                  />
                )}
                {block.type === BlockType.PATH && <PathBlock block={block} />}
              </div>

              {/* Vertical bottom ending line */}
              {(!paths || paths.length === 0) && (
                <div className="overflow-visible">
                  <svg
                    width="5"
                    height="100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line
                      x1="50%"
                      y1="-100%"
                      x2="50%"
                      y2="200%"
                      stroke="#98a1b2"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}

              {paths && (
                <div
                  className={`grid grid-cols-${paths.length} gap-x-48`}
                  style={{
                    gridTemplateColumns: `repeat(${paths.length}, auto)`,
                  }}
                >
                  {paths.map((path, key) => {
                    const isFirstColumn = paths.length !== 1 && key === 0;
                    const isLastColumn =
                      paths.length !== 1 && key === paths.length - 1;
                    const isMiddleColumn =
                      paths.length !== 1 && !isFirstColumn && !isLastColumn;

                    const borderClass =
                      paths.length === 1
                        ? ''
                        : isFirstColumn
                        ? 'custom-border-left-top'
                        : isLastColumn
                        ? 'custom-border-right-top'
                        : 'custom-border-left-top custom-border-right-top';

                    const middleClass =
                      paths.length !== 1 && isMiddleColumn
                        ? 'custom-border-middle-top'
                        : 'custom-border-middle-side';

                    return (
                      <div
                        key={`${block.id}-container-${key}`}
                        className={`flex flex-col items-center ${borderClass} ${middleClass}`}
                      >
                        <Path
                          key={`${block.id}-path-${key}`}
                          pathId={path.id}
                          workspaceId={workspaceId}
                          workflowId={block.workflowId}
                          selectedBlock={selectedBlock}
                          onBlockClick={onBlockClick}
                          closeDetailSidebar={closeDetailSidebar}
                          handleAddBlock={handleAddBlock}
                          disableZoom={disableZoom}
                          copyBlockFn={copyBlockFn}
                          setPathFn={setPathFn}
                          setDefaultPathFn={setDefaultPathFn}
                          onCanvasEvent={onCanvasEvent}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              <AddBlock
                id={index + 1}
                pathId={pathId}
                handleAddBlockFn={handleAddBlockFn}
                handleClick={handleClick}
                onAddBlockClick={(i, type) => onAddBlockClick(i, type)}
                updateBlockDelay={updateBlockDelay}
                selectedBlock={selectedBlock !== null}
                alwaysDisplay={index === blocks.length - 1}
                nextBlock={nextBlock}
              />

              {/* Vertical bottom Link line */}
              {index !== blocks.length - 1 && (
                <svg width="5" height="100" xmlns="http://www.w3.org/2000/svg">
                  <line
                    x1="50%"
                    y1="0%"
                    x2="50%"
                    y2="100%"
                    stroke="#98a1b2"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>
          )}
        </Draggable>
      );
    });
  };

  return (
    <div>
      {overlayVisible && selectedBlock && (
        <ImageOverlay onClose={handleOverlayClose} />
      )}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <StrictModeDroppable droppableId="blocks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex justify-center overflow-visible"
            >
              <div>
                {renderBlocksWithOptions(blockList)}
                <div>{provided.placeholder}</div>
                {blockList.length === 0 && (
                  <div>
                    <AddBlock
                      id={0}
                      pathId={pathId}
                      handleAddBlockFn={handleAddBlockFn}
                      handleClick={handleClick}
                      onAddBlockClick={(i, type) => onAddBlockClick(i, type)}
                      updateBlockDelay={updateBlockDelay}
                      selectedBlock={selectedBlock !== null}
                      alwaysDisplay={true}
                      nextBlock={null}
                    />
                  </div>
                )}
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: mousePosition.x,
                  top: mousePosition.y,
                  backgroundColor: 'rgba(200, 200, 200, 0.8)',
                  padding: '8px',
                  borderRadius: '4px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                  pointerEvents: 'none',
                  opacity: isDragging ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <p>Dragging a block...</p>
              </div>
            </div>
          )}
        </StrictModeDroppable>
      </DragDropContext>
    </div>
  );
};

export default BlockList;
