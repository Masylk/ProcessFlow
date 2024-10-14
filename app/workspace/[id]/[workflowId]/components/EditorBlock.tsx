import React from 'react';
import { Block } from '@/types/block';
import BlockOptionsToggle from './BlockOptionsToggle';

interface EditorBlockProps {
  block: Block;
  onClick: (block: Block, event: React.MouseEvent) => void;
  handleAddBlockFn: (blockData: any, pathId: number, position: number) => void;
  handleDeleteBlockFn: (blockId: number) => void;
}

export default function EditorBlock({
  block,
  onClick,
  handleAddBlockFn,
  handleDeleteBlockFn,
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
        />
      </div>

      <div className="flex-1 w-full">
        <h3 className="text-lg font-bold">{block.type}</h3>
        {block.icon && <img src={block.icon} alt="icon" className="my-2" />}
        {block.description && <p className="text-sm">{block.description}</p>}
      </div>
    </div>
  );
}
