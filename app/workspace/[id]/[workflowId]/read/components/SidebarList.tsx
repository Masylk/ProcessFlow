import React from 'react';
import { Block } from '@/types/block'; // Adjust the import path as needed
import Sidebardiv from './Sidebardiv';

interface SidebarListProps {
  blocks: Block[];
  stepCount: number;
}

const SidebarList: React.FC<SidebarListProps> = ({ blocks, stepCount }) => {
  // Sort blocks by position
  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="p-6 flex-col justify-start items-center gap-2 inline-flex">
      <div className="w-[199px] h-[31px] text-black text-sm font-semibold font-['Inter'] leading-tight">
        {stepCount} Steps
      </div>
      <div className="self-stretch flex-col justify-start items-start gap-1 flex">
        {sortedBlocks.map((block, index) => (
          <Sidebardiv key={block.id} block={block} position={index} />
        ))}
      </div>
    </div>
  );
};

export default SidebarList;
