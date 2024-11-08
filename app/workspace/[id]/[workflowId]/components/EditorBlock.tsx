import React from 'react';
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

export default function EditorBlock({
  block,
  onClick,
  handleAddBlockFn,
  handleDeleteBlockFn,
  copyBlockFn,
}: EditorBlockProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick(block, event);
  };

  return (
    <div
      className="relative border border-black bg-white p-4 m-4 rounded w-80 cursor-pointer"
      onClick={handleClick}
    >
      <div className="absolute top-2 right-2">
        {/* Pass the block prop to BlockOptionsToggle */}
        <BlockOptionsToggle
          block={block}
          handleAddBlockFn={handleAddBlockFn}
          handleDeleteBlockFn={handleDeleteBlockFn}
          copyBlockFn={copyBlockFn}
        />
      </div>

      <div className="flex-1 w-full">
        <h3 className="text-lg font-bold">{block.type}</h3>

        {/* Render the icon if it exists */}
        {block.icon && <img src={block.icon} alt="icon" className="my-2" />}

        {/* Render the description if it exists */}
        {block.description && <p className="text-sm">{block.description}</p>}

        {/* Render the block image if it exists */}
        {block.image && (
          <img
            src={block.image}
            alt="block image"
            className="my-2 w-full h-auto object-cover rounded"
          />
        )}
      </div>
    </div>
  );
}
