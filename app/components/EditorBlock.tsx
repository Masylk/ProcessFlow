// components/EditorBlock.tsx
import React from 'react';
import { Block } from '@/types/block';

interface EditorBlockProps {
  block: Block;
  onClick: (block: Block) => void;
}

export default function EditorBlock({ block, onClick }: EditorBlockProps) {
  return (
    <div>
      <div
        className="border border-black bg-white p-4 m-4 rounded flex flex-col items-center"
        onClick={() => onClick(block)}
      >
        <div className="flex-1 w-full">
          <h3 className="text-lg font-bold">{block.type}</h3>
          {block.icon && <img src={block.icon} alt="icon" className="my-2" />}
          {block.description && <p className="text-sm">{block.description}</p>}
        </div>
        {/* Ensure the vertical rectangle is centered and spaced properly */}
      </div>
      <div className="w-2 h-12 bg-gray-600 mt-2 mx-auto" />
    </div>
  );
}
