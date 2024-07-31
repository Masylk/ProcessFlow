// components/BlockList.tsx
import React from 'react';
import { Block } from '@/types/block';
import EditorBlock from './EditorBlock';
import AddBlock from './AddBlock';

interface BlockListProps {
  blocks: Block[];
  onBlockClick: (block: Block) => void;
  onAddBlock: (position: number) => void;
}

export default function BlockList({
  blocks,
  onBlockClick,
  onAddBlock,
}: BlockListProps) {
  return (
    <div className="space-y-4">
      <AddBlock id={0} onAdd={onAddBlock} />
      {blocks.map((block) => (
        <React.Fragment key={block.id}>
          <EditorBlock block={block} onClick={onBlockClick} />
          <AddBlock id={block.position + 1} onAdd={onAddBlock} />
        </React.Fragment>
      ))}
    </div>
  );
}
