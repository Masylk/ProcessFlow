import React from 'react';
import { Block } from '@/types/block'; // Adjust the import path as needed
import Sidebardiv from './Sidebardiv';

interface SidebarProps {
  blocks: Block[];
  stepCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ blocks, stepCount }) => {
  // Sort blocks by position
  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

  return (
    <div className="w-[292px] bg-white border-r border-[#e4e7ec] justify-start items-start inline-flex overflow-hidden">
      <div className="flex-col justify-start items-start gap-6 inline-flex">
        {/* Header Block */}
        <div className="h-[72px] flex-col justify-center items-start gap-6 inline-flex">
          <div className="self-stretch h-8 pl-6 pr-5 flex-col justify-start items-start flex">
            <div className="w-[142px] justify-start items-start inline-flex">
              <div className="justify-end font-['Inter'] items-center text-xl font-bold gap-3 flex">
                <div className="shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] justify-start items-start inline-flex">
                  <div className="w-8 h-8 relative bg-gradient-to-bl from-[#4d6de3] to-[#1b2860] rounded-lg shadow-[inset_0px_0px_0px_0.6666666865348816px_rgba(16,24,40,0.24)] overflow-hidden">
                    <img
                      src="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/processflow_logo.png"
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                Processflow
              </div>
            </div>
          </div>
        </div>

        {/* Blocks */}
        <div className="p-6 flex-col justify-start items-center gap-2 inline-flex">
          <div className="w-[199px] h-[31px] text-black text-sm font-semibold font-['Inter'] leading-tight">
            {stepCount} Steps
          </div>
          <div className="self-stretch flex-col justify-start items-start gap-1 flex">
            {sortedBlocks.map((block) => (
              <Sidebardiv key={block.id} block={block} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
