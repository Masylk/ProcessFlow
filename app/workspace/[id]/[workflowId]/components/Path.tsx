import React, { useState, useEffect } from 'react';
import BlockList from './BlockList';
import { Block } from '@/types/block';

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
  handleAddBlock: (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => void;
  disableZoom: (isDisabled: boolean) => void; // New prop for controlling zoom/pan
}

const Path: React.FC<PathProps> = ({
  pathId,
  workspaceId,
  workflowId,
  onBlockClick,
  closeDetailSidebar,
  handleAddBlock,
  disableZoom, // Pass down the prop
}) => {
  const [blockList, setBlockList] = useState<Block[]>([]);
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPathData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/workspace/${workspaceId}/paths/${pathId}?workflowId=${workflowId}`
        );

        if (response.ok) {
          const fetchedPathData: PathData = await response.json();

          if (fetchedPathData.blocks && fetchedPathData.blocks.length > 0) {
            setBlockList(fetchedPathData.blocks);
          } else {
            setBlockList([]);
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

  const handleBlockClick = (block: Block) => {
    onBlockClick(block, handleUpdateBlock, handleDeleteBlock);
  };

  const handleAddBlockClick = (position: number) => {
    handleAddBlock(pathId, position, handleAddBlockFn);
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

  const handleAddBlockFn = async (
    blockData: any,
    pathId: number,
    position: number
  ) => {
    if (position === null) return;

    try {
      const requestBody = {
        ...blockData,
        position: position,
        icon: 'default-icon',
        pathId,
        workflowId: workflowId,
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

        // Update blockList with the newly created block
        setBlockList((prevBlockList) => {
          const updatedBlockList = [...prevBlockList];
          updatedBlockList.splice(position, 0, newBlock); // Add the new block at the correct position
          return updatedBlockList;
        });
      } else {
        const errorData = await response.json();
        console.error('Failed to create new block:', errorData);
      }
    } catch (error) {
      console.error('Error creating new block:', error);
    }
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
        const updatedBlockData: Block = await response.json();
        setBlockList((prevBlocks) =>
          prevBlocks.map((block) => {
            if (block.id !== updatedBlockData.id) {
              return block;
            }

            return {
              ...block,
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
    <div className="w-full h-full">
      <div className="text-center">{pathData?.name || 'Loading...'}</div>
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
          handleAddBlock={handleAddBlock}
          disableZoom={disableZoom} // Pass down to BlockList
        />
      ) : (
        <p>Loading blocks...</p>
      )}
    </div>
  );
};

export default Path;
