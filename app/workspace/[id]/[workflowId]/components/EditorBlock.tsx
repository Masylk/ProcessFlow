import React, { useEffect, useRef } from 'react';
import { Block } from '@/types/block';
import BlockOptionsToggle from './BlockOptionsToggle';
import DOMPurify from 'dompurify';

interface EditorBlockProps {
  block: Block;
  onClick: (block: Block, event: React.MouseEvent) => void;
  handleAddBlockFn: (
    blockData: any,
    pathId: number,
    position: number
  ) => Promise<Block | null>;
  handleDeleteBlockFn: (blockId: number) => Promise<void>;
  copyBlockFn: (blockdata: Block) => void;
  isFocused: boolean;
}

const sanitizeDescription = (description: string) => {
  // Sanitize the description
  const sanitizedDescription = DOMPurify.sanitize(description);

  return sanitizedDescription;
};

export default function EditorBlock({
  block,
  onClick,
  handleAddBlockFn,
  handleDeleteBlockFn,
  copyBlockFn,
  isFocused,
}: EditorBlockProps) {
  const blockRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: React.MouseEvent) => {
    onClick(block, event);
  };

  function formatDelay(seconds: number) {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}min`);

    return parts.join(' ');
  }

  return (
    <div
      ref={blockRef}
      id={`block:${block.id}`}
      className={`w-[481px] ${
        block.image ? 'h-[455px]' : 'h-auto'
      } px-6 py-5 rounded-2xl bg-white border border-[#d0d5dd] flex-col justify-start items-start gap-3 inline-flex cursor-pointer overflow-visible ${
        isFocused ? 'z-40' : 'z-10'
      } relative`} // Make the parent container relative
      onClick={handleClick}
    >
      {/* Delay Block */}
      {block.delay && (
        <div
          className="absolute -top-[60px] left-1/2 transform -translate-x-1/2 z-50" // Position directly above the block
        >
          <div className="h-[25px] pl-1.5 pr-2 bg-[#fcead7] rounded-full shadow-[0px_4px_8px_-2px_rgba(16,24,40,0.10)] border border-[#fe692d] justify-start items-center gap-1 inline-flex">
            <img
              src="/assets/workflow/delay-clock-icon.svg"
              alt="Delay Icon"
              className="w-[10.51px] h-[10.51px]"
            />
            <div className="text-center text-[#b54707] text-xs font-medium font-['Inter'] leading-[18px]">
              Delay: {formatDelay(block.delay)}
            </div>
          </div>
        </div>
      )}

      {/* Main Block */}
      <div className="w-full flex justify-start items-center gap-2">
        <div className="h-12 flex justify-start items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 p-1 bg-white rounded-[13.50px] border border-[#e4e7ec] justify-center items-center flex">
            {block.icon && (
              <img src={block.icon} alt="icon" className="w-8 h-8" />
            )}
          </div>

          {/* Title */}
          <div className="flex-col justify-start items-start gap-1 inline-flex">
            <h3 className="text-[#101828] text-base font-semibold font-['Inter'] leading-normal">
              {`${block.title || 'Untitled Block'}`}
            </h3>
          </div>
        </div>

        {/* Options */}
        <div className="ml-auto flex items-center">
          <BlockOptionsToggle
            block={block}
            handleAddBlockFn={handleAddBlockFn}
            handleDeleteBlockFn={handleDeleteBlockFn}
            copyBlockFn={copyBlockFn}
          />
        </div>
      </div>

      {/* Description */}
      {block.description && (
        <div
          className="w-full h-6 overflow-hidden text-[#667085] text-base font-normal font-['Inter'] leading-normal"
          style={{
            maskImage: 'linear-gradient(to right, black 50%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, black 50%, transparent)',
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizeDescription(block.description),
          }}
        />
      )}

      {/* Image */}
      {block.image && (
        <img
          src={block.image}
          alt="block image"
          className="self-stretch h-[260px] rounded-xl border border-[#e4e7ec] object-cover cursor-pointer overflow-hidden"
        />
      )}

      {/* Footer */}
      <div className="w-full flex justify-between items-center mt-1.5">
        {/* Time */}
        <div className="h-[22px] px-2 py-0.5 bg-gray-50 rounded-full border border-[#e4e7ec] justify-start items-center flex">
          <span className="text-center text-[#344054] text-xs font-medium font-['Inter'] leading-[18px]">
            10 min
          </span>
        </div>

        {/* HR Label */}
        <div className="w-10 h-10 relative bg-[#c6d7fe] rounded-full flex justify-center items-center">
          <div className="absolute inset-0 rounded-full border border-black/10"></div>
          <span className="text-[#4761c4] text-base font-semibold font-['Inter'] leading-normal">
            HR
          </span>
        </div>
      </div>
    </div>
  );
}
