// components/BlockList.tsx
import React from 'react';
import { Block } from '@/types/block';
import EditorBlock from './EditorBlock';
import AddBlock from './AddBlock';

interface BlockListProps {
  blocks: Block[];
  onBlockClick: (block: Block) => void;
  onAddBlock: () => void;
}

export default function BlockList({
  blocks,
  onBlockClick,
  onAddBlock,
}: BlockListProps) {
  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <EditorBlock key={block.id} block={block} onClick={onBlockClick} />
      ))}
      <div className="flex justify-center mt-4">
        <AddBlock onAdd={onAddBlock} />
      </div>
    </div>
  );
}
