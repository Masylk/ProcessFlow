import React, { useState, useEffect } from 'react';
import BlockList from './BlockList';
import { Block } from '@/types/block';
import AddBlockForm from './AddBlockForm';
import BlockDetailsSidebar from './BlockDetailsSidebar';
import { useBlockContext } from './BlockContext';

interface PathData {
  id: number;
  name: string;
  workflowId: number;
  pathblockId?: number;
  blocks: Block[];
}

interface PathProps {
  pathId: number;
  workspaceId: number;
  workflowId: number;
  onBlockClick: (
    block: Block,
    updateBlockFn: (updatedBlock: Block) => Promise<void>,
    deleteBlockFn: (blockId: number) => Promise<void>
  ) => void;
  closeDetailSidebar: () => void;
}

const Path: React.FC<PathProps> = ({
  pathId,
  workspaceId,
  workflowId,
  onBlockClick,
  closeDetailSidebar,
}) => {
  const [isAddBlockFormOpen, setIsAddBlockFormOpen] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [blockList, setBlockList] = useState<Block[]>([]); // State to hold blocks
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch path data including blocks when the component is mounted
  useEffect(() => {
    const fetchPathData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/workspace/${workspaceId}/paths/${pathId}?workflowId=${workflowId}`
        );

        if (response.ok) {
          const fetchedPathData: PathData = await response.json();

          // Verify blocks data before setting state
          if (fetchedPathData.blocks && fetchedPathData.blocks.length > 0) {
            console.log(fetchedPathData.blocks);
            setBlockList(fetchedPathData.blocks);
          } else {
            setBlockList([]); // Set empty if no blocks exist
          }
          setPathData(fetchedPathData);
        } else {
          console.error('Failed to fetch path data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching path data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPathData();
  }, [pathId, workspaceId, workflowId]);

  // Function to handle block click and set handlers
  const handleBlockClick = (block: Block) => {
    console.log(pathId);
    onBlockClick(block, handleUpdateBlock, handleDeleteBlock); // Use the passed callback
    console.log('hello: ' + pathId);
  };

  const handleAddBlockClick = (position: number) => {
    setInsertPosition(position);
    setIsAddBlockFormOpen(true);
  };

  const handleBlocksReorder = async (reorderedBlocks: Block[]) => {
    const updatedPositions = reorderedBlocks.map((block, index) => ({
      id: block.id,
      position: index,
    }));

    try {
      const response = await fetch(
        `/api/workflows/${workflowId}/reorder-blocks`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedPositions),
        }
      );

      if (response.ok) {
        setBlockList(reorderedBlocks);
      } else {
        console.error('Failed to update block positions');
      }
    } catch (error) {
      console.error('Error updating block positions:', error);
    }
  };

  const handleAddBlock = async (blockData: any) => {
    setIsAddBlockFormOpen(false);
    if (insertPosition === null) return;

    try {
      const requestBody = {
        ...blockData,
        position: insertPosition,
        icon: 'default-icon',
        pathId,
        workflowId,
        pathBlock:
          blockData.type === 'PATH'
            ? { pathOptions: blockData.pathOptions }
            : undefined,
      };

      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const newBlock = await response.json();
        setBlockList((prevBlocks) => {
          const updatedBlocks = [...prevBlocks];
          updatedBlocks.splice(insertPosition, 0, newBlock);
          return updatedBlocks;
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to create new block:', errorData);
      }
    } catch (error) {
      console.error('Error creating new block:', error);
    }

    setInsertPosition(null);
  };

  const handleUpdateBlock = async (updatedBlock: Block) => {
    try {
      const response = await fetch(`/api/blocks/${updatedBlock.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: updatedBlock.type,
          position: updatedBlock.position,
          icon: updatedBlock.icon,
          description: updatedBlock.description,
          pathId: updatedBlock.pathId,
          workflowId: updatedBlock.workflowId,
        }),
      });

      if (response?.ok) {
        console.log(pathId);
        console.log(updatedBlock.pathId);
        const updatedBlockData: Block = await response.json();
        setBlockList((prevBlocks) =>
          prevBlocks.map((block) => {
            if (block.id !== updatedBlockData.id) {
              return block; // Return unchanged blocks
            }

            // Merge the updated fields with the existing block, keeping relations intact
            return {
              ...block,
              // Only update fields that are present in the updatedBlockData
              ...(updatedBlockData.type !== undefined && {
                type: updatedBlockData.type,
              }),
              ...(updatedBlockData.position !== undefined && {
                position: updatedBlockData.position,
              }),
              ...(updatedBlockData.icon !== undefined && {
                icon: updatedBlockData.icon,
              }),
              ...(updatedBlockData.description !== undefined && {
                description: updatedBlockData.description,
              }),
              ...(updatedBlockData.pathId !== undefined && {
                pathId: updatedBlockData.pathId,
              }),
              ...(updatedBlockData.workflowId !== undefined && {
                workflowId: updatedBlockData.workflowId,
              }),
            };
          })
        );
      } else {
        console.error('Failed to update block');
      }
    } catch (error) {
      console.error('Error updating block:', error);
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    try {
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlockList((prevBlocks) =>
          prevBlocks.filter((block) => block.id !== blockId)
        );
        closeDetailSidebar();
      } else {
        console.error('Failed to delete block');
      }
    } catch (error) {
      console.error('Error deleting block:', error);
    }
  };

  return (
    <div className="path-container">
      <div className="path-title text-center">
        {pathData?.name || 'Loading...'}
      </div>
      {!loading ? (
        <BlockList
          blocks={blockList}
          workspaceId={workspaceId}
          pathId={pathId}
          onBlockClick={onBlockClick}
          onAddBlockClick={handleAddBlockClick}
          onBlocksReorder={handleBlocksReorder}
          handleBlockClick={handleBlockClick}
          closeDetailSidebar={closeDetailSidebar}
        />
      ) : (
        <p>Loading blocks...</p>
      )}
      {isAddBlockFormOpen && insertPosition !== null && (
        <AddBlockForm
          onSubmit={handleAddBlock}
          onCancel={() => setIsAddBlockFormOpen(false)}
          initialPosition={insertPosition}
          workflowId={workflowId}
        />
      )}
      {/* {selectedBlock && (
        <BlockDetailsSidebar
          block={selectedBlock}
          onClose={() => setSelectedBlock(null)}
          onUpdate={handleUpdateBlock}
          onDelete={handleDeleteBlock}
        />
      )} */}
    </div>
  );
};

export default Path;
