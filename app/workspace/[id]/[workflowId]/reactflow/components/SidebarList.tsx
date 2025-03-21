import React from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { StrictModeDroppable } from '@/app/components/StrictModeDroppable';
import SidebarBlock from '@/app/workspace/[id]/[workflowId]/reactflow/components/SidebarBlock';
import { Block } from '@/types/block';
import * as ReactBeautifulDnd from 'react-beautiful-dnd';
import { useColors } from '@/app/theme/hooks';

interface SidebarListProps {
  blocks: Block[];
  onNodeFocus: (nodeId: string) => void;
  onReorder: (newBlocks: Block[]) => void;
  workspaceId: string;
  workflowId: string;
  searchFilter: string;
}

const SidebarList: React.FC<SidebarListProps> = ({
  blocks,
  onNodeFocus,
  onReorder,
  workspaceId,
  workflowId,
  searchFilter,
}) => {
  const colors = useColors();
  
  // Filter blocks based on search term
  const filteredBlocks = blocks.filter(block => 
    (block.title?.toLowerCase() || '').includes(searchFilter.toLowerCase()) ||
    (block.description?.toLowerCase() || '').includes(searchFilter.toLowerCase()) ||
    (block.step_block?.stepDetails?.toLowerCase() || '').includes(searchFilter.toLowerCase())
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedBlocks = Array.from(blocks);
    const [movedBlock] = reorderedBlocks.splice(result.source.index, 1);
    reorderedBlocks.splice(result.destination.index, 0, movedBlock);

    onReorder(reorderedBlocks);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <StrictModeDroppable droppableId="sidebar-list">
        {(provided, snapshot) => (
          <ul
            className="space-y-1"
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: filteredBlocks.length ? 'auto' : '1px',
              opacity: 1, // Always fully visible
              backgroundColor: colors['bg-primary']
            }}
          >
            {filteredBlocks.map((block, index) => (
              <Draggable
                key={block.id.toString()}
                draggableId={block.id.toString()}
                index={index}
              >
                {(provided, snapshot) => {
                  // This fixes the issue with disappearing items
                  const draggableStyle = {
                    ...provided.draggableProps.style,
                    left: snapshot.isDragging 
                      ? (provided.draggableProps.style as ReactBeautifulDnd.DraggingStyle)?.left || 'auto' 
                      : 'auto',
                    top: snapshot.isDragging 
                      ? (provided.draggableProps.style as ReactBeautifulDnd.DraggingStyle)?.top || 'auto' 
                      : 'auto',
                    opacity: snapshot.isDragging ? 0.6 : 1,
                    background: snapshot.isDragging ? colors['bg-secondary'] : 'transparent',
                    boxShadow: snapshot.isDragging ? `0 5px 10px ${colors['bg-overlay']}` : 'none',
                    zIndex: snapshot.isDragging ? 9999 : 'auto'
                  };

                  return (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={draggableStyle}
                      className={snapshot.isDragging ? 'dragging' : ''}
                    >
                      <SidebarBlock
                        block={block}
                        onNodeFocus={onNodeFocus}
                        dragHandleProps={provided.dragHandleProps}
                        searchFilter={searchFilter}
                      />
                    </li>
                  );
                }}
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