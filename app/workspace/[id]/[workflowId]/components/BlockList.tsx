import React, { useEffect, useState } from 'react';
import { Block, PathOption, PathOptionBlock } from '@/types/block';
import EditorBlock from './EditorBlock';
import AddBlock from './AddBlock';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '@/app/components/StrictModeDroppable';
import Path from './Path'; // Import the Path component

interface BlockListProps {
  blocks: Block[];
  onBlockClick: (block: Block) => void;
  onAddBlockClick: (position: number) => void;
  onBlocksReorder: (reorderedBlocks: Block[]) => void;
  onUpdatePathOption: (pathOptionId: number, relatedBlockId: number) => void;
}

const BlockList: React.FC<BlockListProps> = ({
  blocks,
  onBlockClick,
  onAddBlockClick,
  onBlocksReorder,
  onUpdatePathOption,
}) => {
  const [relatedBlocks, setRelatedBlocks] = useState<
    Record<number, PathOptionBlock[]>
  >({});
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);

  useEffect(() => {
    const fetchRelatedBlocksForAllPathOptions = async () => {
      for (const block of blocks) {
        if (block.type === 'PATH' && block.pathBlock) {
          for (const option of block.pathBlock.pathOptions || []) {
            try {
              const response = await fetch(
                `/api/path-options/${option.id}/related-blocks`
              );
              if (response.ok) {
                const data = await response.json();
                setRelatedBlocks((prev) => ({
                  ...prev,
                  [option.id]: data.map((item: PathOptionBlock) => item),
                }));
              } else {
                console.error('Failed to fetch related blocks');
              }
            } catch (error) {
              console.error('Error fetching related blocks:', error);
            }
          }
        }
      }
    };

    fetchRelatedBlocksForAllPathOptions();
  }, [blocks]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedBlocks = Array.from(blocks);
    const [reorderedItem] = reorderedBlocks.splice(result.source.index, 1);
    reorderedBlocks.splice(result.destination.index, 0, reorderedItem);

    onBlocksReorder(reorderedBlocks);
  };

  const handleAddPathOption = (blockId: number) => {
    const updatedBlocks = blocks.map((block) => {
      if (block.id === blockId && block.pathBlock) {
        const newOption: PathOption = {
          id: Date.now(), // Placeholder ID, should be replaced by actual ID from the server
          pathOption: 'New Option', // Default new option text
        };

        return {
          ...block,
          pathBlock: {
            ...block.pathBlock,
            pathOptions: [...(block.pathBlock.pathOptions || []), newOption],
          },
        };
      }
      return block;
    });

    onBlocksReorder(updatedBlocks);
  };

  const handleAddRelatedBlock = async (
    pathOptionId: number,
    blockId: number
  ) => {
    try {
      const response = await fetch(
        `/api/path-options/${pathOptionId}/related-blocks`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blockId }),
        }
      );

      if (response.ok) {
        console.log('Related block added successfully');
        onUpdatePathOption(pathOptionId, blockId);
        // Fetch updated related blocks
        const updatedResponse = await fetch(
          `/api/path-options/${pathOptionId}/related-blocks`
        );
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setRelatedBlocks((prev) => ({
            ...prev,
            [pathOptionId]: data.map((item: PathOptionBlock) => item),
          }));
        }
      } else {
        console.error('Failed to update PathOption with related block');
        const errorData = await response.json();
        console.error('Error details:', errorData.error);
      }
    } catch (error) {
      console.error('Error in handleAddRelatedBlock:', error);
    }
  };

  const renderBlocksWithOptions = (blocks: Block[]) => {
    return blocks.flatMap((block, index) => {
      if (block.type === 'PATH' && block.pathBlock) {
        const pathOptions = block.pathBlock.pathOptions || [];
        return (
          <div key={`path-block-${block.id}`}>
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
                  <div className="flex flex-wrap items-center gap-2 mt-2 w-full">
                    {pathOptions.map(
                      (option: PathOption, optionIndex: number) => (
                        <div
                          key={`${block.id}-option-${optionIndex}`}
                          className="flex-grow"
                        >
                          <Path
                            title={option.pathOption}
                            blocks={relatedBlocks[option.id] || []}
                            onBlockClick={onBlockClick}
                            onAddBlockClick={onAddBlockClick}
                            onBlocksReorder={onBlocksReorder}
                            onUpdatePathOption={handleAddRelatedBlock}
                          />
                          {/* <AddBlock
                            id={index + pathOptions.length}
                            onAdd={() => handleAddPathOption(block.id)}
                            label="Add Path Option"
                          /> */}
                        </div>
                      )
                    )}
                    <AddBlock
                      id={index + 1}
                      onAdd={onAddBlockClick}
                      label="Add Block"
                    />
                  </div>
                </div>
              )}
            </Draggable>
          </div>
        );
      } else {
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
                <AddBlock
                  id={index + 1}
                  onAdd={onAddBlockClick}
                  label="Add Block"
                />
              </div>
            )}
          </Draggable>
        );
      }
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
            {renderBlocksWithOptions(blocks)}
            {provided.placeholder}
            {blocks.length === 0 && (
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
