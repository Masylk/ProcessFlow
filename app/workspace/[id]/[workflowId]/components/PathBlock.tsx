import React from 'react';
import { Block } from '@/types/block'; // Adjust the import path as necessary

const PathBlock: React.FC<{ block: Block }> = ({ block }) => {
  // Helper function to format delay in days/hours/minutes
  const formatDelay = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${
      minutes > 0 ? `${minutes}min` : ''
    }`.trim();
  };

  return (
    <div className="relative flex flex-col w-[481px] items-center gap-12">
      {/* Main Path Block */}
      <div
        id={`block:${block.id}`}
        className="w-[60px] h-[60px] -rotate-45 bg-[#f2f4f7] rounded-xl shadow-[0px_4px_8px_-2px_rgba(16,24,40,0.10)] border border-[#e4e7ec] flex items-center justify-center -translate-y-12"
      >
        <span className="rotate-45 text-black">OU</span>
      </div>
    </div>
  );
};

export default PathBlock;
