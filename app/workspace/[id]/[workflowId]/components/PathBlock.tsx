import React from 'react';
import { Block } from '@/types/block'; // Adjust the import path as necessary

const PathBlock: React.FC<{ block: Block }> = ({ block }) => (
  <div
    id={`block:${block.id}`}
    className="w-[60px] h-[60px] -rotate-45 bg-[#f2f4f7] rounded-xl shadow-[0px_4px_8px_-2px_rgba(16,24,40,0.10)] border border-[#e4e7ec] flex items-center justify-center translate-y-[-50px]"
  >
    <span className="rotate-45 text-black">OU</span>
  </div>
);

export default PathBlock;
