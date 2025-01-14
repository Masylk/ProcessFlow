'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar, { PathObject, SidebarBlock } from '../components/Sidebar';
import Canvas from '../components/Canvas';
import StatusIndicator from '../components/StatusIndicator';
import TitleBar from '../components/TitleBar';
import { Path } from '@/types/path';
import { BlockProvider } from '../components/BlockContext';
import { Block } from '@/types/block';
import { conformsTo } from 'lodash';
import { TransformState } from '@/types/transformstate';
import ButtonCTA from '@/app/components/ButtonCTA';
import WorkflowHeader from '../components/WorkflowHeader';
import { title } from 'process';

export enum CanvasEventType {
  PATH_CREATION,
  SUBPATH_CREATION,
  BLOCK_ADD,
  BLOCK_DEL,
  BLOCK_REORDER,
  BLOCK_UPDATE,
  BLOCK_POSITION,
}

export enum SidebarEventType {
  FOCUS,
  REORDER,
}

export interface CanvasEvent {
  type: CanvasEventType;
  pathId: number;
  blockId?: number;
  pathName?: string;
  blocks?: Block[];
  subpaths?: PathObject[];
  coordinates?: { x: number; y: number };
  handleBlocksReorder?: (reorderedBlocks: Block[]) => Promise<void>;
}

export interface SidebarEvent {
  type: SidebarEventType;
  pathId?: number;
  blocks?: Block[];
  focusId?: string;
}

export default function WorkflowPage() {
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname.split('/');
  const workflowId = pathSegments[pathSegments.length - 2];
  const id = pathSegments[pathSegments.length - 3];
  const [path, setPath] = useState<Path | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastRequestStatus, setLastRequestStatus] = useState<boolean | null>(
    null
  );
  const [focusId, setFocusId] = useState<string | null>(null);
  const [sidebarPath, setSidebarPath] = useState<PathObject | null>(null);
  const [transformState, setTransformState] = useState<TransformState>({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });

  const handleTransformChange = (state: TransformState) => {
    // console.log(state);
    // setTransformState(state);
  };

  useEffect(() => {
    if (id && workflowId) {
      fetchPaths(id, workflowId);
      fetchWorkflowTitle(workflowId);
    }
  }, [id, workflowId]);

  const fetchPaths = async (id: string, workflowId: string) => {
    try {
      const response = await fetch(
        `/api/workspace/${id}/paths?workflowId=${workflowId}`
      );
      if (!response.ok) throw new Error('Failed to fetch paths');

      const data = await response.json();
      setPath(data.paths && data.paths[0] ? data.paths[0] : null);
      setLastRequestStatus(true);
    } catch (error) {
      console.error('Error fetching paths:', error);
      setLastRequestStatus(false);
    }
  };

  const fetchWorkflowTitle = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflow/${workflowId}/title`);
      if (!response.ok) throw new Error('Failed to fetch workflow title');

      const data = await response.json();
      setWorkflowTitle(data.title);
    } catch (error) {
      console.error('Error fetching workflow title:', error);
    }
  };

  const updateWorkflowTitle = async (newTitle: string) => {
    try {
      const response = await fetch(`/api/workflow/${workflowId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error('Failed to update workflow title');

      setWorkflowTitle(newTitle);
    } catch (error) {
      console.error('Error updating workflow title:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goBack = () => {
    router.back();
  };

  const handleSidebarEvent = (eventData: SidebarEvent) => {
    console.log('sidebar event!');
    if (eventData.type === SidebarEventType.FOCUS && eventData.focusId) {
      setFocusId(eventData.focusId);

      // Reset focusId to null after 0.1 second
      setTimeout(() => {
        setFocusId(null);
      }, 100);
    }
    return null;
  };

  const handleCanvasEvent = (eventData: CanvasEvent) => {
    setSidebarPath((prevSidebarPath) => {
      const updatedPath = handleEventLogic(prevSidebarPath, eventData);
      return updatedPath;
    });
  };

  const handleEventLogic = (
    sidebarPath: PathObject | null,
    eventData: CanvasEvent
  ): PathObject | null => {
    if (
      eventData.type === CanvasEventType.PATH_CREATION &&
      !sidebarPath &&
      eventData.blocks &&
      eventData.pathName &&
      eventData.handleBlocksReorder
    ) {
      const newSidebarPath: PathObject = {
        id: eventData.pathId,
        name: eventData.pathName,
        blocks: eventData.blocks.map((block) => ({
          id: block.id,
          type: block.type,
          position: block.position,
          icon: block.icon,
          title: block.title,
          description: block.description,
        })),
        handleBlocksReorder: eventData.handleBlocksReorder,
      };
      return newSidebarPath;
    } else if (sidebarPath) {
      if (
        eventData.type === CanvasEventType.SUBPATH_CREATION &&
        eventData.subpaths &&
        eventData.blockId &&
        sidebarPath.blocks
      ) {
        const updatedSidebarPath = updateBlockInNestedPaths(
          sidebarPath.blocks,
          eventData.blockId,
          eventData.subpaths
        );
        return { ...sidebarPath, blocks: updatedSidebarPath };
      } else if (
        eventData.type === CanvasEventType.PATH_CREATION &&
        sidebarPath.blocks &&
        eventData.blocks &&
        eventData.handleBlocksReorder
      ) {
        const newBlocks = eventData.blocks;
        const updatedBlocks = createBlocks(
          sidebarPath.blocks,
          eventData.pathId,
          newBlocks,
          eventData.handleBlocksReorder
        );
        return {
          ...sidebarPath,
          blocks: updatedBlocks,
        };
      } else if (
        (eventData.type === CanvasEventType.BLOCK_ADD ||
          eventData.type === CanvasEventType.BLOCK_REORDER ||
          eventData.type === CanvasEventType.BLOCK_DEL ||
          eventData.type === CanvasEventType.BLOCK_UPDATE) &&
        sidebarPath.blocks &&
        eventData.blocks
      ) {
        console.log('blocklist update');
        const updatedBlocks = updateBlocks(
          sidebarPath.blocks,
          sidebarPath.id,
          eventData.pathId,
          eventData.blocks,
          eventData.type
        );
        return { ...sidebarPath, blocks: updatedBlocks };
      }
    }
    return sidebarPath;
  };

  const updateBlockPositions = (blocks: SidebarBlock[]): SidebarBlock[] => {
    // Update positions to match the array indices
    return blocks.map((block, index) => ({
      ...block,
      position: index,
    }));
  };

  const addBlocks = (
    blocks: SidebarBlock[],
    updatedBlocks: Block[]
  ): SidebarBlock[] => {
    let updatedBlockList = [...blocks];

    updatedBlocks.forEach((newBlock, index) => {
      const existingBlockIndex = updatedBlockList.findIndex(
        (block) => block.id === newBlock.id
      );

      if (existingBlockIndex !== -1) {
        updatedBlockList[existingBlockIndex] = {
          ...updatedBlockList[existingBlockIndex],
          position: newBlock.position,
        };
      } else {
        updatedBlockList.splice(index, 0, {
          id: newBlock.id,
          type: newBlock.type,
          position: index,
          icon: newBlock.icon,
          title: newBlock.title,
          description: newBlock.description,
          subpaths: [],
        });
      }
    });

    return updateBlockPositions(updatedBlockList);
  };

  const updateBlocksDetails = (
    blocks: SidebarBlock[],
    updatedBlocks: Block[]
  ): SidebarBlock[] => {
    return blocks.map((block) => {
      const updatedBlock = updatedBlocks.find((b) => b.id === block.id);
      return updatedBlock
        ? {
            ...block,
            type: updatedBlock.type,
            position: updatedBlock.position,
            icon: updatedBlock.icon,
            title: updatedBlock.title,
            description: updatedBlock.description,
            subpaths: block.subpaths,
          }
        : block;
    });
  };

  const deleteBlocks = (
    blocks: SidebarBlock[],
    updatedBlocks: Block[]
  ): SidebarBlock[] => {
    return blocks.filter((block) =>
      updatedBlocks.some((keepBlock) => keepBlock.id === block.id)
    );
  };

  const reorderBlocks = (
    blocks: SidebarBlock[],
    updatedBlocks: Block[]
  ): SidebarBlock[] => {
    const updatedPositionMap = new Map(
      updatedBlocks.map((updatedBlock, index) => [updatedBlock.id, index])
    );

    return blocks
      .map((block) => {
        const newPosition = updatedPositionMap.get(block.id);
        return newPosition !== undefined
          ? { ...block, position: newPosition }
          : block;
      })
      .sort((a, b) => a.position - b.position);
  };

  const updateBlocks = (
    blocks: SidebarBlock[],
    sidebarPathId: number,
    eventPathId: number,
    updatedBlocks: Block[],
    eventType: CanvasEventType
  ): SidebarBlock[] => {
    // Helper function to recursively update the blocks within a matching subpath
    const updateSubpathBlocks = (
      blocks: SidebarBlock[],
      pathId: number
    ): SidebarBlock[] => {
      return blocks.map((block) => {
        if (block.subpaths) {
          block.subpaths = block.subpaths.map((subpath) => {
            if (subpath.id === pathId) {
              // Update the subpath blocks based on the event type
              switch (eventType) {
                case CanvasEventType.BLOCK_ADD:
                  subpath.blocks = addBlocks(
                    subpath.blocks || [],
                    updatedBlocks
                  );
                  break;

                case CanvasEventType.BLOCK_UPDATE:
                  subpath.blocks = updateBlocksDetails(
                    subpath.blocks || [],
                    updatedBlocks
                  );
                  break;

                case CanvasEventType.BLOCK_DEL:
                  subpath.blocks = deleteBlocks(
                    subpath.blocks || [],
                    updatedBlocks
                  );
                  break;

                case CanvasEventType.BLOCK_REORDER:
                  subpath.blocks = reorderBlocks(
                    subpath.blocks || [],
                    updatedBlocks
                  );
                  break;
              }
            } else if (subpath.blocks) {
              // Recursively search and update nested subpaths
              subpath.blocks = updateSubpathBlocks(subpath.blocks, pathId);
            }
            return subpath;
          });
        }
        return block;
      });
    };

    // If the event path ID matches the sidebar path ID, update the top-level blocks
    if (sidebarPathId === eventPathId) {
      switch (eventType) {
        case CanvasEventType.BLOCK_ADD:
          return addBlocks(blocks, updatedBlocks);

        case CanvasEventType.BLOCK_UPDATE:
          return updateBlocksDetails(blocks, updatedBlocks);

        case CanvasEventType.BLOCK_DEL:
          return deleteBlocks(blocks, updatedBlocks);

        case CanvasEventType.BLOCK_REORDER:
          return reorderBlocks(blocks, updatedBlocks);

        default:
          return blocks;
      }
    }

    // If the event path ID does not match the sidebar path ID, update the relevant subpath
    return updateSubpathBlocks(blocks, eventPathId);
  };

  const createBlocks = (
    blocks: SidebarBlock[],
    pathId: number,
    newBlocks: Block[],
    handleBlocksReorder?: (reorderedBlocks: Block[]) => Promise<void>
  ): SidebarBlock[] => {
    return blocks.map((block) => {
      if (block.subpaths) {
        return {
          ...block,
          subpaths: block.subpaths.map((subpath) => {
            if (subpath.id === pathId) {
              return {
                ...subpath,
                blocks:
                  subpath.blocks && subpath.blocks.length > 0
                    ? subpath.blocks // Keep existing blocks if present
                    : [
                        ...(subpath.blocks || []),
                        ...newBlocks.map((newBlock) => ({
                          id: newBlock.id,
                          type: newBlock.type,
                          position: newBlock.position,
                          icon: newBlock.icon,
                          title: newBlock.title,
                          description: newBlock.description,
                        })),
                      ],
                handleBlocksReorder: handleBlocksReorder,
              };
            }
            return {
              ...subpath,
              blocks: createBlocks(subpath.blocks || [], pathId, newBlocks),
            };
          }),
        };
      }
      return block;
    });
  };

  const updateBlockInNestedPaths = (
    blocks: SidebarBlock[],
    blockId: number,
    newSubpaths: PathObject[]
  ): SidebarBlock[] => {
    return blocks.map((block) => {
      if (block.id === blockId) {
        // Check if each newSubpath already exists in the block's subpaths.
        const updatedSubpaths = newSubpaths.filter(
          (newSubpath) =>
            !block.subpaths?.some(
              (existingSubpath) => existingSubpath.id === newSubpath.id
            )
        );

        // Add only the new subpaths that don't already exist
        return {
          ...block,
          subpaths: [...(block.subpaths ?? []), ...updatedSubpaths],
        };
      }

      if (block.subpaths) {
        return {
          ...block,
          subpaths: block.subpaths.map((subpath) => ({
            ...subpath,
            blocks: updateBlockInNestedPaths(
              subpath.blocks ?? [],
              blockId,
              newSubpaths
            ),
          })),
        };
      }

      return block;
    });
  };

  return (
    <div className="overflow-hidden h-screen w-screen">
      <div className="relative flex flex-col w-full">
        {/* Use WorkflowHeader */}
        <WorkflowHeader
          workflowTitle={workflowTitle}
          updateWorkflowTitle={updateWorkflowTitle}
        />
        <div className="flex flex-1">
          {/* Main Content */}
          <main className="flex-1 bg-gray-100 p-6 ml-0 h-screen w-screen overflow-hidden">
            {/* <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSidebar}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                </button>
              </div>
            </div> */}

            {path ? (
              <BlockProvider>
                <Canvas
                  initialPath={path}
                  workspaceId={id}
                  workflowId={workflowId}
                  focusId={focusId}
                  onCanvasEvent={handleCanvasEvent}
                  onTransformChange={handleTransformChange}
                  sidebarPath={sidebarPath}
                  onSidebarEvent={handleSidebarEvent}
                />
              </BlockProvider>
            ) : (
              <p>Loading path...</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
