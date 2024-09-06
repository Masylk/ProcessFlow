'use client';

import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';
import { Path as PathType } from '@/types/path';
import Path from './Path'; // Ensure the path to the Path component is correct
import BlockDetailsSidebar from './BlockDetailsSidebar'; // Import the sidebar component

interface CanvasProps {
  initialPath: PathType;
  workspaceId: string;
  workflowId: string;
}

export default function Canvas({
  initialPath,
  workspaceId,
  workflowId,
}: CanvasProps) {
  const [path, setPath] = useState<PathType | null>(initialPath);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [handleUpdateBlock, setHandleUpdateBlock] = useState<
    ((updatedBlock: Block) => Promise<void>) | null
  >(null);
  const [handleDeleteBlock, setHandleDeleteBlock] = useState<
    ((blockId: number) => Promise<void>) | null
  >(null);

  useEffect(() => {
    setPath(initialPath);
  }, [initialPath]);

  // Handles block click and sets corresponding update and delete handlers
  const handleBlockClick = (
    block: Block,
    updateBlockFn: (updatedBlock: Block) => Promise<void>,
    deleteBlockFn: (blockId: number) => Promise<void>
  ) => {
    setSelectedBlock(block);
    setHandleUpdateBlock(() => updateBlockFn);
    setHandleDeleteBlock(() => deleteBlockFn);
  };

  // Closes the sidebar and resets the selected block
  const handleCloseSidebar = () => {
    setSelectedBlock(null);
  };

  return (
    <div className="flex">
      <div className="flex-1 p-6">
        {path ? (
          <Path
            key={path.id}
            pathId={path.id}
            workspaceId={parseInt(workspaceId)}
            workflowId={path.workflowId}
            onBlockClick={handleBlockClick} // Pass the click handler to Path
            closeDetailSidebar={handleCloseSidebar}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
      {/* Render the sidebar if a block is selected */}
      {selectedBlock && handleUpdateBlock && handleDeleteBlock && (
        <BlockDetailsSidebar
          block={selectedBlock}
          onClose={handleCloseSidebar}
          onUpdate={async (updatedBlock) => {
            await handleUpdateBlock(updatedBlock); // Ensure the correct function reference is used
            handleCloseSidebar(); // Close the sidebar after update
          }}
          onDelete={async (blockId) => {
            await handleDeleteBlock(blockId); // Ensure the correct function reference is used
            handleCloseSidebar(); // Close the sidebar after delete
          }}
        />
      )}
    </div>
  );
}
