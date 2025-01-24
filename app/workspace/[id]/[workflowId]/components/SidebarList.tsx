import React from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import SidebarDiv from './SidebarDiv';
import { StrictModeDroppable } from '@/app/components/StrictModeDroppable';
import { SidebarBlock } from '@/types/sidebar';
import { SidebarEvent } from '@/types/sidebarevent';

interface SidebarListProps {
  blocks: SidebarBlock[];
  onSidebarEvent: (eventData: SidebarEvent) => void;
  onReorder: (newBlocks: SidebarBlock[]) => void; // Add a callback for reordering
  workspaceId: string;
  workflow_id: string;
  searchFilter: string; // Add the searchFilter prop
}

const SidebarList: React.FC<SidebarListProps> = ({
  blocks,
  onSidebarEvent,
  onReorder,
  workspaceId,
  workflow_id,
  searchFilter, // Destructure searchFilter
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
              <Draggable
                key={block.id}
                draggableId={block.id.toString()}
                index={index}
              >
                {(provided) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps} // Keep draggableProps on the parent
                  >
                    <SidebarDiv
                      block={block}
                      onSidebarEvent={onSidebarEvent}
                      workspaceId={workspaceId}
                      workflow_id={workflow_id}
                      searchFilter={searchFilter} // Pass searchFilter to SidebarDiv
                      dragHandleProps={provided.dragHandleProps} // Pass dragHandleProps to SidebarDiv
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
