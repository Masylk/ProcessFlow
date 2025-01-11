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
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }

    return parts.length > 1
      ? parts.slice(0, -1).join(', ') + ' and ' + parts.slice(-1)
      : parts[0];
  }

  return (
    <div className="flex flex-col gap-3 w-[481px]">
      {/* Delay Block */}
      {block.delay && (
        <div className="h-[124px] px-6 py-5 bg-white rounded-2xl shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#d0d5dd] flex flex-col justify-start items-start gap-3 overflow-hidden">
          {/* Top Row: Icon, Text, and Dots */}
          <div className="w-full flex justify-between items-center">
            {/* Left Section: Delay Icon and Text */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 p-3 bg-white rounded-[13.50px] border border-[#e4e7ec] justify-center items-center flex overflow-hidden">
                <img
                  src="/assets/workflow/adddelay-icon.svg"
                  alt="Delay Icon"
                  className="w-6 h-6"
                />
              </div>
              <div className="flex flex-col justify-start items-start">
                <div className="text-[#101828] text-base font-semibold font-['Inter'] leading-normal">
                  Delay
                </div>
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
          <div className="w-full">
            <span className="text-[#667085] text-base font-normal font-['Inter'] leading-normal">
              Wait{' '}
            </span>
            <span className="text-[#475467] text-base font-semibold font-['Inter'] leading-normal">
              {formatDelay(block.delay)}
            </span>
          </div>
        </div>
      )}

      {/* Main Block */}
      <div
        ref={blockRef}
        id={`block:${block.id}`}
        className={`w-[481px] ${
          block.image ? 'h-[455px]' : 'h-auto'
        } px-6 py-5 rounded-2xl bg-white border border-[#d0d5dd] flex flex-col justify-start items-start gap-3 cursor-pointer overflow-visible ${
          isFocused ? 'z-40' : 'z-10'
        } relative`}
        onClick={handleClick}
      >
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
    </div>
  );
}
