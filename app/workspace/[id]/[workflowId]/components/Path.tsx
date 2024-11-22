import React, { useState, useEffect } from 'react';
import BlockList from './BlockList';
import { Block } from '@/types/block';
import { CanvasEvent, CanvasEventType } from '../page';
import { useTransformContext } from 'react-zoom-pan-pinch';

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
  disableZoom: (isDisabled: boolean) => void;
  copyBlockFn: (blockdata: Block) => void;
  setPathFn: (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => void;
  setDefaultPathFn: (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<void>
  ) => void;
  onCanvasEvent: (eventData: CanvasEvent) => void;
}

const Path: React.FC<PathProps> = ({
  pathId,
  workspaceId,
  workflowId,
  onBlockClick,
  closeDetailSidebar,
  handleAddBlock,
  disableZoom,
  copyBlockFn,
  setPathFn,
  setDefaultPathFn,
  onCanvasEvent,
}) => {
  const [blockList, setBlockList] = useState<Block[]>([]);
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [loading, setLoading] = useState(true);
  // Get transform state from context
  const { transformState } = useTransformContext();

  // Log the transform state whenever it changes
  useEffect(() => {
    if (transformState) {
      console.log('Current Transform State:', transformState);
    }
  }, [transformState]); // Re-run whenever transformState changes

  useEffect(() => {
    setDefaultPathFn(pathId, blockList.length + 1, handleAddBlockFn);
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
            onCanvasEvent({
              type: CanvasEventType.PATH_CREATION,
              pathId: pathId,
              pathName: fetchedPathData.name,
              blocks: fetchedPathData.blocks,
            });
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
        console.log(reorderedBlocks);
        setBlockList(reorderedBlocks);
        if (pathData)
          onCanvasEvent({
            type: CanvasEventType.BLOCK_REORDER,
            pathId: pathId,
            pathName: pathData.name,
            blocks: reorderedBlocks,
          });
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
    position: number,
    imageUrl?: string // Optional image URL parameter
  ) => {
    if (position === null) return;

    try {
      const requestBody = {
        ...blockData,
        position: position,
        icon: 'default-icon',
        pathId,
        workflowId: workflowId,
        image: imageUrl || null, // Include the image URL if provided
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
          updatedBlockList.splice(position, 0, newBlock);
          if (pathData)
            onCanvasEvent({
              type: CanvasEventType.BLOCK_ADD,
              pathId: pathId,
              pathName: pathData?.name,
              blocks: updatedBlockList,
            });
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

  const handleUpdateBlock = async (
    updatedBlock: Block,
    imageFile?: File,
    iconFile?: File
  ) => {
    let imageUrl: string | undefined;
    let iconUrl: string | undefined; // For storing the uploaded icon URL

    // If there is an image file, upload it and get the URL
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          imageUrl = url; // Set the image URL to be sent with the block update
        } else {
          console.error('Image upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    // If there is an icon file, upload it and get the URL
    if (iconFile) {
      const formData = new FormData();
      formData.append('file', iconFile);

      try {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          iconUrl = url; // Set the icon URL to be sent with the block update
        } else {
          console.error('Icon upload failed');
        }
      } catch (error) {
        console.error('Error uploading icon:', error);
      }
    }

    try {
      const response = await fetch(`/api/blocks/${updatedBlock.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: updatedBlock.type,
          position: updatedBlock.position,
          icon: iconUrl || updatedBlock.icon, // Include the icon URL or keep existing one
          description: updatedBlock.description,
          pathId: updatedBlock.pathId,
          workflowId: updatedBlock.workflowId,
          image: imageUrl || updatedBlock.image, // Include the image URL or keep existing one
          imageDescription: updatedBlock.imageDescription,
          clickPosition: updatedBlock.clickPosition, // Include the updated clickPosition
        }),
      });

      if (response?.ok) {
        const updatedBlockData: Block = await response.json();

        setBlockList((prevBlocks) => {
          const updatedBlockList = prevBlocks.map((block) => {
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
              ...(updatedBlockData.image !== undefined && {
                image: updatedBlockData.image,
              }),
              ...(updatedBlockData.clickPosition !== undefined && {
                clickPosition: updatedBlockData.clickPosition,
              }),
              ...(updatedBlockData.imageDescription !== undefined && {
                imageDescription: updatedBlockData.imageDescription,
              }),
            };
          });

          if (pathData) {
            onCanvasEvent({
              type: CanvasEventType.BLOCK_UPDATE,
              pathId: pathId,
              pathName: pathData.name,
              blocks: updatedBlockList,
            });
          }

          return updatedBlockList;
        });
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
        setBlockList((prevBlocks) => {
          const updatedBlockList = prevBlocks.filter(
            (block) => block.id !== blockId
          );
          if (pathData)
            onCanvasEvent({
              type: CanvasEventType.BLOCK_DEL,
              pathId: pathId,
              pathName: pathData.name,
              blocks: updatedBlockList,
            });
          return updatedBlockList;
        });
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
          handleAddBlockFn={handleAddBlockFn}
          handleDeleteBlockFn={handleDeleteBlock}
          disableZoom={disableZoom}
          copyBlockFn={copyBlockFn}
          setPathFn={setPathFn}
          setDefaultPathFn={setDefaultPathFn}
          onCanvasEvent={onCanvasEvent}
        />
      ) : (
        <p>Loading blocks...</p>
      )}
    </div>
  );
};

export default Path;
