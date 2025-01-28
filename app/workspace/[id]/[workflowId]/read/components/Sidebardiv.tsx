import React from 'react';
import { Block } from '@/types/block'; // Adjust the import path as needed

interface SidebardivProps {
  block: Block;
  isActive?: boolean;
}

const Sidebardiv: React.FC<SidebardivProps> = ({ block, isActive = false }) => {
  return (
    <div
      className={`px-3 py-1.5 rounded-lg justify-center items-center gap-2 inline-flex ${
        isActive ? 'bg-[#4761c4]' : ''
      }`}
    >
      <div
        className={`text-sm font-bold font-['Inter'] leading-tight ${
          isActive ? 'text-white' : 'text-[#101828]'
        }`}
      >
        {block.position}.
      </div>
      <div className="justify-start items-center gap-1 flex">
        <div
          className={`w-4 h-4 ${
            isActive
              ? 'px-[1.33px] py-[3.33px]'
              : 'relative shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]'
          } justify-center items-center flex overflow-hidden`}
        />
        <div
          className={`w-[181px] text-sm font-medium font-['Inter'] leading-tight ${
            isActive ? 'text-white' : 'text-[#667085]'
          }`}
        >
          {block.description || 'No description available'}
        </div>
      </div>
    </div>
  );
};

export default Sidebardiv;
