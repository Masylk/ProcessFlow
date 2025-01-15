import React, { useState, useEffect } from 'react';
import BlockList from './BlockList';
import { Block, BlockType } from '@/types/block';
import { CanvasEvent, CanvasEventType } from '../edit/page';
import { useTransformContext } from 'react-zoom-pan-pinch';
import { title } from 'process';

interface PathData {
  id: number;
  name: string;
  workflowId: number;
  pathblockId?: number;
  blocks: Block[];
}

interface PathProps {
  firstPath?: boolean;
  pathId: number;
  workspaceId: number;
  workflowId: number;
  selectedBlock: Block | null;
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
    ) => Promise<Block | null>,
    chosenType?: BlockType
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
    ) => Promise<Block | null>
  ) => void;
  setDefaultPathFn: (
    pathId: number,
    position: number,
    addBlockFn: (
      blockData: any,
      pathId: number,
      position: number
    ) => Promise<Block | null>
  ) => void;
  onCanvasEvent: (eventData: CanvasEvent) => void;
}

const Path: React.FC<PathProps> = ({
  firstPath = false,
  pathId,
  workspaceId,
  workflowId,
  selectedBlock,
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
  const DEFAULT_ICON = '/step-icons/default-icons/container.svg';

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

          // Trigger the onCanvasEvent first
          onCanvasEvent({
            type: CanvasEventType.PATH_CREATION,
            pathId: pathId,
            pathName: fetchedPathData.name,
            blocks: fetchedPathData.blocks || [],
            handleBlocksReorder: async (reorderedBlocks) =>
              await handleBlocksReorder(reorderedBlocks),
          });

          setBlockList(fetchedPathData.blocks);
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

  const handleAddBlockClick = (position: number, chosenType?: BlockType) => {
    handleAddBlock(pathId, position, handleAddBlockFn, chosenType);
  };

  const handleBlocksReorder = async (reorderedBlocks: Block[]) => {
    // Calculate the updated positions

    try {
      const updatedPositions = reorderedBlocks.map((block, index) => ({
        id: block.id,
        position: index,
      }));
      // Perform the fetch request to reorder blocks
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

      if (!response.ok) {
        throw new Error('Failed to reorder blocks');
      }

      // Update blockList state
      setBlockList((prevBlockList) => {
        // Update positions in the block list
        const updatedBlockList = prevBlockList.map((block) => {
          const updatedBlock = updatedPositions.find(
            (updated) => updated.id === block.id
          );
          return updatedBlock
            ? { ...block, position: updatedBlock.position }
            : block;
        });

        // Sort the blocks by their updated position
        const sortedBlockList = updatedBlockList.sort(
          (a, b) => a.position - b.position
        );

        // Trigger onCanvasEvent with BLOCK_REORDER if pathData is available
        onCanvasEvent({
          type: CanvasEventType.BLOCK_REORDER,
          pathId: pathId,
          blocks: sortedBlockList,
        });

        return sortedBlockList; // Return the sorted block list
      });

      console.log('Blocks reordered successfully');
    } catch (error) {
      console.error('Error reordering blocks:', error);
    }
  };

  const handleAddBlockFn = async (
    blockData: any,
    pathId: number,
    position: number,
    imageUrl?: string
  ): Promise<Block | null> => {
    if (position === null) return null;

    console.log('adding: ' + blockData.delay);

    // Check if blockData.position matches any existing block position
    // const matchingBlock = blockList.find(
    //   (block) => block.position === position
    // );
    // if (matchingBlock) {
    //   console.log(`Conflict: A block already exists at position ${position}`);

    //   // Check if blockData.delay is different from the matchingBlock.delay
    //   // if (blockData.delay !== matchingBlock.delay) {
    //   //   console.log(
    //   //     `Delay mismatch: blockData.delay (${blockData.delay}) is different from matchingBlock.delay (${matchingBlock.delay})`
    //   //   );

    //   //   // Call handleUpdateBlock with updatedBlock and skip the rest of the function
    //   //   // await handleUpdateBlock(
    //   //   //   { ...matchingBlock, delay: blockData.delay }, // Update the delay in the matching block
    //   //   //   undefined, // No image file provided
    //   //   //   undefined // No icon file provided
    //   //   // );

    //   //   return null; // Exit the function early
    //   // }
    // }

    try {
      const requestBody = {
        ...blockData,
        position: position,
        icon: blockData.icon || DEFAULT_ICON,
        delay: blockData.delay || null,
        pathId,
        workflowId: workflowId,
        image: imageUrl || null,
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

        return newBlock; // Return the newly created block
      } else {
        const errorData = await response.json();
        console.error('Failed to create new block:', errorData);
        return null;
      }
    } catch (error) {
      console.error('Error creating new block:', error);
      return null;
    }
  };

  const handleUpdateBlock = async (
    updatedBlock: Block,
    imageFile?: File,
    iconFile?: File
  ) => {
    let imageUrl: string | undefined;
    let iconUrl: string | undefined;

    console.log('updating the block');

    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);

      try {
        console.log('uploading an image');
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const { filePath } = await uploadResponse.json();
          imageUrl = filePath;
          console.log('uploaded: ' + imageUrl);
        } else {
          console.error('Image upload failed');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

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
          iconUrl = url;
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
          title: updatedBlock.title,
          icon: iconUrl || updatedBlock.icon,
          description: updatedBlock.description,
          pathId: updatedBlock.pathId,
          workflowId: updatedBlock.workflowId,
          averageTime: updatedBlock.averageTime,
          taskType: updatedBlock.taskType,
          image: imageUrl || updatedBlock.image,
          imageDescription: updatedBlock.imageDescription,
          clickPosition: updatedBlock.clickPosition,
        }),
      });

      if (response?.ok) {
        const updatedBlockData: Block = await response.json();

        console.log('updated block: ' + updatedBlockData.image);
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
              ...(updatedBlockData.title !== undefined && {
                title: updatedBlockData.title,
              }),
              ...(updatedBlockData.averageTime !== undefined && {
                averageTime: updatedBlockData.averageTime,
              }),
              ...(updatedBlockData.taskType !== undefined && {
                taskType: updatedBlockData.taskType,
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
    <div className="w-full h-full pt-0">
      <div className="relative w-full flex justify-center items-center">
        {/* Conditionally render text div based on firstPath */}
        {firstPath ? (
          <div className="absolute top-[50%] h-[22px] pl-1.5 pr-2 py-0.5 bg-[#edf0fb] rounded-full border border-[#aebbed] justify-start items-center gap-0.5 inline-flex">
            <div className="w-3 h-3 relative overflow-hidden">
              <img
                src="/assets/workflow/magic-wand-icon.svg"
                alt="Magic Wand Icon"
                className="w-full h-full"
              />
            </div>
            <div className="text-center text-[#374c99] text-xs font-medium font-['Inter'] leading-[18px]">
              This is where your process starts
            </div>
          </div>
        ) : (
          <div className="absolute top-[50%] h-[22px] px-1.5 py-0.5 bg-white rounded-md shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center inline-flex">
            <div className="text-center text-[#344054] text-xs font-medium font-['Inter'] leading-[18px]">
              {pathData?.name || 'Loading...'}
            </div>
          </div>
        )}

        {/* Vertical TOP SVG Line */}
        <svg width="5" height="10%">
          <line
            x1="50%"
            y1="50%"
            x2="50%"
            y2={firstPath ? '100%' : '100%'}
            stroke="#98A2B3"
            strokeWidth="2"
          />
        </svg>
      </div>

      {!loading ? (
        <BlockList
          blocks={blockList}
          workspaceId={workspaceId}
          pathId={pathId}
          selectedBlock={selectedBlock}
          onBlockClick={onBlockClick}
          onAddBlockClick={handleAddBlockClick}
          onBlocksReorder={handleBlocksReorder}
          handleBlockClick={handleBlockClick}
          closeDetailSidebar={closeDetailSidebar}
          handleAddBlock={handleAddBlock}
          handleUpdateBlockFn={handleUpdateBlock}
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
