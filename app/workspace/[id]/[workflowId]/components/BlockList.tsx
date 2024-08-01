// components/BlockList.tsx
import React from 'react';
import { Block } from '@/types/block';
import EditorBlock from './EditorBlock';
import AddBlock from './AddBlock';

interface BlockListProps {
  blocks: Block[];
  onBlockClick: (block: Block) => void;
  onAddBlockClick: (position: number) => void;
}

export default function BlockList({
  blocks,
  onBlockClick,
  onAddBlockClick,
}: BlockListProps) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <React.Fragment key={block.id}>
          <EditorBlock block={block} onClick={onBlockClick} />
          <AddBlock id={index + 1} onAdd={onAddBlockClick} />
        </React.Fragment>
      ))}
      {blocks.length === 0 && <AddBlock id={0} onAdd={onAddBlockClick} />}
    </div>
  );
}
