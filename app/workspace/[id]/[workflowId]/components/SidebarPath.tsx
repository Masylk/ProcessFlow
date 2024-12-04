import React from 'react';
import SidebarList from './SidebarList';
import { PathObject, SidebarBlock } from './Sidebar';
import { TransformState } from '@/types/transformstate';
import { SidebarEvent } from '../page';
import { Block } from '@/types/block';

interface SidebarPathProps {
  path: PathObject;
  transformState: TransformState;
  onSidebarEvent: (eventData: SidebarEvent) => void;
  workspaceId: string;
  workflowId: string;
}

const SidebarPath: React.FC<SidebarPathProps> = ({
  path,
  transformState,
  onSidebarEvent,
  workspaceId,
  workflowId,
}) => {
  const handleReorder = async (reorderedBlocks: SidebarBlock[]) => {
    if (path.blocks) {
      // Reorder path.blocks to match the reorderedBlocks
      path.blocks = reorderedBlocks.map(
        (block) =>
          path.blocks!.find((originalBlock) => originalBlock.id === block.id)!
      );

      // Convert path.blocks (SidebarBlock[]) into Block[]
      const convertedBlocks: Block[] = path.blocks.map((sidebarBlock) => ({
        id: sidebarBlock.id,
        type: sidebarBlock.type,
        position: sidebarBlock.position,
        title: sidebarBlock.description || 'Default Title', // Use a placeholder if no title
        icon: sidebarBlock.icon,
        description: sidebarBlock.description,
        pathId: path.id,
        workflowId: Number(workflowId), // Convert workflowId to number
      }));
      
      // Call path.handleBlocksReorder if defined
      if (path.handleBlocksReorder) {
        await path.handleBlocksReorder(convertedBlocks);
      }
    }
  };

  return (
    <div className="p-4 bg-white shadow-md rounded mb-4">
      <h2 className="text-xl font-semibold mb-2">{path.name}</h2>
      {path.blocks && path.blocks.length > 0 && (
        <SidebarList
          blocks={path.blocks}
          transformState={transformState}
          onSidebarEvent={onSidebarEvent}
          onReorder={handleReorder}
        />
      )}
    </div>
  );
};

export default SidebarPath;
