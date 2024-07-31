'use client';

import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';
import BlockList from './BlockList';
import BlockDetailsSidebar from './BlockDetailsSidebar';

interface CanvasProps {
  initialBlocks: Block[];
  workspaceId: string;
  workflowId: string;
  onAddBlock: () => void;
}

export default function Canvas({
  initialBlocks,
  workspaceId,
  workflowId,
  onAddBlock,
}: CanvasProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const addBlock = async (position: number) => {
    const newBlockData = {
      type: 'New Block Type',
      position: position,
      icon: '',
      description: 'New block description',
      workflowId: parseInt(workflowId),
    };

    const response = await fetch('/api/blocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newBlockData),
    });

    if (response.ok) {
      const newBlock: Block = await response.json();
      setBlocks((prevBlocks) => {
        const updatedBlocks = [
          ...prevBlocks.slice(0, position),
          newBlock,
          ...prevBlocks.slice(position).map((block) => ({
            ...block,
            position: block.position + 1,
          })),
        ];
        return updatedBlocks;
      });
      onAddBlock(); // Fetch the blocks again to ensure they are updated from the database
    } else {
      console.error('Failed to add block');
    }
  };

  const handleBlockClick = (block: Block) => {
    setSelectedBlock(block);
  };

  const handleCloseSidebar = () => {
    setSelectedBlock(null);
  };

  const handleUpdateBlock = async (updatedBlock: Block) => {
    const response = await fetch(`/api/blocks/${updatedBlock.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: updatedBlock.type,
        description: updatedBlock.description,
        position: updatedBlock.position,
        icon: updatedBlock.icon,
        workflowId: updatedBlock.workflowId,
      }),
    });

    if (response.ok) {
      const updatedBlockData: Block = await response.json();
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.id === updatedBlockData.id ? updatedBlockData : block
        )
      );
    } else {
      console.error('Failed to update block');
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    const response = await fetch(`/api/blocks/${blockId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setBlocks((prevBlocks) =>
        prevBlocks.filter((block) => block.id !== blockId)
      );
    } else {
      console.error('Failed to delete block');
    }
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
