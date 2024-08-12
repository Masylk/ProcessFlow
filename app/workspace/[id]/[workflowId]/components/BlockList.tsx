// components/BlockList.tsx
import React from 'react';
import { Block } from '@/types/block';
import EditorBlock from './EditorBlock';
import AddBlock from './AddBlock';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '@/app/components/StrictModeDroppable';

interface BlockListProps {
  blocks: Block[];
  onBlockClick: (block: Block) => void;
  onAddBlockClick: (position: number) => void;
  onBlocksReorder: (reorderedBlocks: Block[]) => void;
}

export default function BlockList({
  blocks,
  onBlockClick,
  onAddBlockClick,
  onBlocksReorder,
}: BlockListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedBlocks = Array.from(blocks);
    const [reorderedItem] = reorderedBlocks.splice(result.source.index, 1);
    reorderedBlocks.splice(result.destination.index, 0, reorderedItem);

    onBlocksReorder(reorderedBlocks);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <StrictModeDroppable droppableId="blocks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {blocks.map((block, index) => (
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
                  >
                    <EditorBlock block={block} onClick={onBlockClick} />
                    <AddBlock id={index + 1} onAdd={onAddBlockClick} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {blocks.length === 0 && (
              <div>
                <AddBlock id={0} onAdd={onAddBlockClick} />
              </div>
            )}
          </div>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
}