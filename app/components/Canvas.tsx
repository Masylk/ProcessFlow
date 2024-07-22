'use client';

import React, { useState } from 'react';
import { Block } from '@/types/block';
import BlockList from './BlockList';
import BlockDetailsSidebar from './BlockDetailsSidebar';

interface CanvasProps {
  initialBlocks: Block[];
}

export default function Canvas({ initialBlocks }: CanvasProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  const addBlock = () => {
    const newBlock: Block = {
      id: blocks.length + 1,
      type: 'New Block',
      position: blocks.length + 1,
      // icon: null,
      description: 'This is a new block',
      // workflowId: 101,
      // workflow: { id: 101, name: 'Workflow A' },
      // actions: [],
    };

    setBlocks([...blocks, newBlock]);
  };

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block);
  };

  const handleCloseSidebar = () => {
    setSelectedBlock(null);
  };

  const handleUpdateBlock = (updatedBlock: Block) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === updatedBlock.id ? updatedBlock : block
      )
    );
  };

  const handleDeleteBlock = (blockId: number) => {
    setBlocks((prevBlocks) =>
      prevBlocks.filter((block) => block.id !== blockId)
    );
  };

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        <BlockList
          blocks={blocks}
          onBlockClick={handleBlockClick}
          onAddBlock={addBlock}
        />
      </div>
      {selectedBlock && (
        <BlockDetailsSidebar
          block={selectedBlock}
          onClose={handleCloseSidebar}
          onUpdate={handleUpdateBlock}
          onDelete={handleDeleteBlock}
        />
      )}
    </div>
  );
}
