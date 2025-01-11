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
      {/* Delay Block */}
      {block.delay && (
        <div className="h-[124px] w-full px-6 py-5 bg-white rounded-2xl shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#d0d5dd] flex flex-col justify-between gap-3 overflow-hidden">
          {/* Top Row: Icon, Text, and Dots */}
          <div className="flex justify-between items-center">
            {/* Left Section: Delay Icon and Text */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 p-3 bg-white rounded-[13.50px] border border-[#e4e7ec] flex justify-center items-center overflow-hidden">
                <img
                  src="/assets/workflow/adddelay-icon.svg"
                  alt="Delay Icon"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[#101828] text-base font-semibold font-['Inter'] leading-normal">
                  Delay
                </span>
              </div>
            </div>

            {/* Right Section: Dots Icon */}
            <div className="w-6 h-6 flex justify-center items-center">
              <img
                src="/assets/shared_components/dots-horizontal.svg"
                alt="Options"
                className="w-6 h-6"
              />
            </div>
          </div>

          {/* Bottom Row: Delay Description */}
          <div>
            <span className="text-[#667085] text-base font-normal font-['Inter'] leading-normal">
              Wait{' '}
            </span>
            <span className="text-[#475467] text-base font-semibold font-['Inter'] leading-normal">
              {formatDelay(block.delay)}
            </span>
          </div>
        </div>
      )}

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
