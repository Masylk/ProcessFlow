import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';
import BlockOptionsToggle from './BlockOptionsToggle';

interface EditorBlockProps {
  block: Block;
  onClick: (block: Block, event: React.MouseEvent) => void;
  handleAddBlockFn: (
    blockData: any,
    pathId: number,
    position: number
  ) => Promise<void>;
  handleDeleteBlockFn: (blockId: number) => Promise<void>;
  copyBlockFn: (blockdata: Block) => void;
}

const ImageOverlay = ({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Full screen"
        className="max-w-2/3 max-h-2/3 object-cover rounded shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking on the image
      />
    </div>
  );
};

export default function EditorBlock({
  block,
  onClick,
  handleAddBlockFn,
  handleDeleteBlockFn,
  copyBlockFn,
}: EditorBlockProps) {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const handleClick = (event: React.MouseEvent) => {
    onClick(block, event);
  };

  const handleImageClick = (event: React.MouseEvent) => {
    setOverlayVisible(true);
  };

  // Default title fallback
  const defaultTitle = 'Untitled Block';

  // Determine parent height based on the presence of an image
  const parentHeight = block.image ? 'h-[455px]' : 'h-[154px]';

  return (
    <div
      className={`w-[481px] ${parentHeight} px-6 py-5 bg-white rounded-2xl shadow shadow-inner border border-[#d0d5dd] flex-col justify-start items-start gap-3 inline-flex cursor-pointer`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="w-full flex justify-start items-center gap-2">
        <div className="h-12 flex justify-start items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 p-1 bg-white rounded-[13.50px] border border-[#e4e7ec] justify-center items-center flex">
            {block.icon && (
              <img
                src={block.icon}
                alt="icon"
                className="w-[30px] h-[30px] object-cover"
              />
            )}
          </div>

          {/* Title */}
          <div className="flex-col justify-start items-start gap-1 inline-flex">
            <h3 className="text-[#101828] text-base font-semibold font-['Inter'] leading-normal">
              {`${block.position + 1}. ${block.title || defaultTitle}`}
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
        <p className="w-full text-[#667085] text-base font-normal font-['Inter'] leading-normal">
          {block.description}
        </p>
      )}

      {/* Image or Placeholder */}
      {block.image ? (
        <img
          src={block.image}
          alt="block image"
          className="self-stretch h-[267px] px-6 py-4 rounded-xl border border-[#e4e7ec] object-cover cursor-pointer"
          onClick={handleImageClick}
        />
      ) : (
        <div className="self-stretch h-[10px] rounded-xl border border-[#e4e7ec] bg-white flex items-center justify-center">
          <span className="text-[#667085] text-xs font-normal font-['Inter']">
            No Image Available
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="w-full flex justify-between items-center">
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

      {isOverlayVisible && block.image && (
        <ImageOverlay
          src={block.image}
          onClose={() => setOverlayVisible(false)}
        />
      )}
    </div>
  );
}
