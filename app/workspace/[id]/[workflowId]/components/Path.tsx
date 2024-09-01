import React from 'react';
import BlockList from './BlockList'; // Ensure the path to BlockList is correct
import { Block, PathOptionBlock } from '@/types/block'; // Adjust import paths as needed

interface PathProps {
  title: string; // The text to display in the div
  blocks: Block[]; // List of blocks to pass to BlockList
  onBlockClick: (block: Block) => void;
  onAddBlockClick: (position: number) => void;
  onBlocksReorder: (reorderedBlocks: Block[]) => void;
  onUpdatePathOption: (pathOptionId: number, relatedBlockId: number) => void;
}

const Path: React.FC<PathProps> = ({
  title,
  blocks,
  onBlockClick,
  onAddBlockClick,
  onBlocksReorder,
  onUpdatePathOption,
}) => {
  return (
    <div className="path-container">
      <div className="path-title text-center">{title}</div>
      <BlockList
        blocks={blocks}
        onBlockClick={onBlockClick}
        onAddBlockClick={onAddBlockClick}
        onBlocksReorder={onBlocksReorder}
        onUpdatePathOption={onUpdatePathOption}
      />
    </div>
  );
};

export default Path;
