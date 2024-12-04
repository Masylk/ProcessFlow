import React from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import SidebarDiv from './SidebarDiv';
import { SidebarBlock } from './Sidebar';
import { TransformState } from '@/types/transformstate';
import { SidebarEvent } from '../page';
import { StrictModeDroppable } from '@/app/components/StrictModeDroppable';

interface SidebarListProps {
  blocks: SidebarBlock[];
  transformState: TransformState;
  onSidebarEvent: (eventData: SidebarEvent) => void;
  onReorder: (newBlocks: SidebarBlock[]) => void; // Add a callback for reordering
}

const SidebarList: React.FC<SidebarListProps> = ({
  blocks,
  transformState,
  onSidebarEvent,
  onReorder,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedBlocks = Array.from(blocks);
    const [movedBlock] = reorderedBlocks.splice(result.source.index, 1);
    reorderedBlocks.splice(result.destination.index, 0, movedBlock);

    onReorder(reorderedBlocks); // Notify parent about the new order
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <StrictModeDroppable droppableId="sidebar-list">
        {(provided) => (
          <ul
            className="space-y-1"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {blocks.map((block, index) => (
              <Draggable key={block.id} draggableId={block.id.toString()} index={index}>
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <SidebarDiv
                      block={block}
                      transformState={transformState}
                      onSidebarEvent={onSidebarEvent}
                    />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </StrictModeDroppable>
    </DragDropContext>
  );
};

export default SidebarList;
