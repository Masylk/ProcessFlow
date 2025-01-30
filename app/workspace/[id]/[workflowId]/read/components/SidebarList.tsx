import React from 'react';
import { Block } from '@/types/block'; // Adjust the import path as needed
import Sidebardiv from './Sidebardiv';

interface SidebarListProps {
  blocks: Block[];
  workspaceId: number;
}

const SidebarList: React.FC<SidebarListProps> = ({ blocks, workspaceId }) => {
  // Sort blocks by position

  return (
    <div className="self-stretch flex-col justify-start items-start gap-1 flex">
      {blocks.map((block, index) => (
        <Sidebardiv
          key={block.id}
          block={block}
          position={index}
          workspaceId={workspaceId}
        />
      ))}
    </div>
  );
};

export default SidebarList;
