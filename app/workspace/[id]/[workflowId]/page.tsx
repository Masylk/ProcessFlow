'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar, { PathObject, SidebarBlock } from './components/Sidebar';
import Canvas from './components/Canvas';
import StatusIndicator from './components/StatusIndicator';
import TitleBar from './components/TitleBar';
import { Path } from '@/types/path';
import { BlockProvider } from './components/BlockContext';
import { Block } from '@/types/block';
import { conformsTo } from 'lodash';

export enum CanvasEventType {
  PATH_CREATION,
  SUBPATH_CREATION,
  BLOCK_ADD,
  BLOCK_DEL,
  BLOCK_REORDER,
  BLOCK_UPDATE,
}

export interface CanvasEvent {
  type: CanvasEventType;
  pathId: number;
  blockId?: number;
  pathName?: string;
  blocks?: Block[];
  subpaths?: PathObject[];
}

export default function WorkflowPage() {
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname.split('/');
  const workflowId = pathSegments[pathSegments.length - 1];
  const id = pathSegments[pathSegments.length - 2];
  const [path, setPath] = useState<Path | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastRequestStatus, setLastRequestStatus] = useState<boolean | null>(
    null
  );
  const [sidebarPath, setSidebarPath] = useState<PathObject | null>(null);

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
      eventData.pathName
    ) {
      const newSidebarPath: PathObject = {
        id: eventData.pathId,
        name: eventData.pathName,
        blocks: eventData.blocks.map((block) => ({
          id: block.id,
          type: block.type,
          position: block.position,
          icon: block.icon,
          description: block.description,
        })),
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
        eventData.blocks
      ) {
        console.log('path creation');
        const newBlocks = eventData.blocks;
        const updatedBlocks = createBlocks(
          sidebarPath.blocks,
          eventData.pathId,
          newBlocks
        );
        return { ...sidebarPath, blocks: updatedBlocks };
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

  const updateBlocks = (
    blocks: SidebarBlock[],
    sidebarPathId: number,
    eventPathId: number,
    updatedBlocks: Block[],
    eventType: CanvasEventType
  ): SidebarBlock[] => {
    // Check if the sidebarPathId matches the eventPathId
    if (sidebarPathId !== eventPathId) {
      // If the IDs don't match, return the blocks unchanged
      return blocks;
    }

    switch (eventType) {
      case CanvasEventType.BLOCK_UPDATE:
        // Update existing blocks by applying changes from updatedBlocks
        return blocks.map((block) => {
          const updatedBlock = updatedBlocks.find((b) => b.id === block.id);
          return updatedBlock
            ? {
                ...block,
                type: updatedBlock.type,
                position: updatedBlock.position,
                icon: updatedBlock.icon,
                description: updatedBlock.description,
                subpaths: block.subpaths, // keep subpaths unchanged
              }
            : block;
        });

      case CanvasEventType.BLOCK_ADD:
        // Add new blocks from updatedBlocks
        const newBlocks = updatedBlocks.filter(
          (newBlock) => !blocks.some((block) => block.id === newBlock.id)
        );

        // Insert new blocks and adjust positions to avoid conflicts
        const updatedBlocksList = [
          ...blocks,
          ...newBlocks.map((newBlock) => ({
            id: newBlock.id,
            type: newBlock.type,
            position: newBlock.position,
            icon: newBlock.icon,
            description: newBlock.description,
            subpaths: [], // Initialize with no subpaths
          })),
        ];

        // Sort by position, and if there's a conflict, adjust positions
        return updatedBlocksList
          .sort((a, b) => a.position - b.position)
          .map((block, index) => ({
            ...block,
            position: index, // Reassign sequential positions to maintain order
          }));

      case CanvasEventType.BLOCK_DEL:
        // Keep only blocks that are in updatedBlocks
        return blocks.filter((block) =>
          updatedBlocks.some((keepBlock) => keepBlock.id === block.id)
        );

      case CanvasEventType.BLOCK_REORDER:
        // Reorder blocks based on updatedBlocks' positions
        return blocks
          .map((block) => {
            const reorderedBlock = updatedBlocks.find((b) => b.id === block.id);
            return reorderedBlock
              ? {
                  ...block,
                  position: reorderedBlock.position,
                }
              : block;
          })
          .sort((a, b) => a.position - b.position) // Sort by position after reordering
          .map((block, index) => ({
            ...block,
            position: index, // Reassign sequential positions to ensure no gaps or conflicts
          }));

      default:
        return blocks;
    }
  };

  const createBlocks = (
    blocks: SidebarBlock[],
    pathId: number,
    newBlocks: Block[]
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
                          description: newBlock.description,
                        })),
                      ],
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
    <body className=" overflow-hidden h-screen w-screen">
      <div className="relative flex flex-col w-full">
        <TitleBar title={workflowTitle} onUpdateTitle={updateWorkflowTitle} />
        <div className="flex flex-1">
          <div
            className={`absolute inset-y-0 left-0 z-10 bg-white transition-transform duration-300 ease-in-out ${
              isSidebarOpen
                ? 'translate-x-0 w-64'
                : '-translate-x-full w-0 hidden'
            }`}
          >
            {sidebarPath ? (
              <Sidebar
                onHideSidebar={toggleSidebar}
                initialPath={sidebarPath}
                workspaceId={id}
                workflowId={workflowId}
              />
            ) : (
              <p></p>
            )}
          </div>
          <main className="flex-1 bg-gray-100 p-6 ml-0 h-screen w-screen overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleSidebar}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                  {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                </button>
                <button
                  onClick={goBack}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
              </div>
              <StatusIndicator isSuccess={lastRequestStatus} />
            </div>
            {path ? (
              <BlockProvider>
                <Canvas
                  initialPath={path}
                  workspaceId={id}
                  workflowId={workflowId}
                  onCanvasEvent={handleCanvasEvent}
                />
              </BlockProvider>
            ) : (
              <p>Loading path...</p>
            )}
          </main>
        </div>
      </div>
    </body>
  );
}
