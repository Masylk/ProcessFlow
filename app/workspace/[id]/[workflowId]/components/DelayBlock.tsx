import React from 'react';
import { Block } from '@/types/block';

const DelayBlock: React.FC<{ block: Block }> = ({ block }) => {
  const delay = block.delayBlock?.delay ?? 0; // Fallback to 0 if delayBlock or delay is undefined

  return (
    <div
      id={`block:${block.id}`}
      className="h-[25px] pl-1.5 pr-2 bg-[#fcead7] rounded-full shadow-[0px_4px_8px_-2px_rgba(16,24,40,0.10)] border border-[#fe692d] justify-start items-center gap-1 inline-flex"
    >
      <img
        src="/assets/workflow/delay-clock-icon.svg"
        alt="Delay Icon"
        className="w-[10.51px] h-[10.51px]"
      />
      <div className="text-center text-[#b54707] text-xs font-medium font-['Inter'] leading-[18px]">
        Delay: {delay}min
      </div>
    </div>
  );
};

export default DelayBlock;
