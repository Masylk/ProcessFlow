import React from 'react';
import { Block } from '@/types/block';
import BlockOptionsToggle from './BlockOptionsToggle'; // Import the toggle component

interface EditorBlockProps {
  block: Block;
  onClick: (block: Block, event: React.MouseEvent) => void; // Include event in the callback
}

export default function EditorBlock({ block, onClick }: EditorBlockProps) {
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents the click from bubbling up
    onClick(block, event); // Pass block and event to the parent handler
  };

  return (
    <div
      className="relative border border-black bg-white p-4 m-4 rounded w-80"
      onClick={handleClick}
    >
      {/* BlockOptionsToggle placed in the top right corner */}
      <div className="absolute top-2 right-2">
        <BlockOptionsToggle />
      </div>

      <div className="flex-1 w-full">
        <h3 className="text-lg font-bold">{block.type}</h3>
        {block.icon && <img src={block.icon} alt="icon" className="my-2" />}
        {block.description && <p className="text-sm">{block.description}</p>}
      </div>
    </div>
  );
}
