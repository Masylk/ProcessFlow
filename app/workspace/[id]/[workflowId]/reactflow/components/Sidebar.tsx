import React, { useState, useRef, useMemo } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Block, Path } from '../types';
import { PathContainer } from './PathContainer';
import { usePathsStore } from '../store/pathsStore';
import { BlockEndType, BlockType } from '@/types/block';

interface SidebarProps {
  workspaceId: string;
  workflowId: string;
}

export function Sidebar({ workspaceId, workflowId }: SidebarProps) {
  const originalPaths = usePathsStore((state) => state.paths);
  const paths = useMemo(
    () =>
      originalPaths.map((path) => ({
        ...path,
        blocks: path.blocks.map((block) => ({
          ...block,
          child_paths: block.child_paths
            ? block.child_paths.map((cp) => ({
                ...cp,
                path: { ...cp.path },
                block: { ...cp.block },
              }))
            : [],
          path: { ...path },
        })),
        parent_blocks: path.parent_blocks.map((pb) => ({
          ...pb,
          block: { ...pb.block },
        })),
      })),
    [originalPaths]
  );
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<number>>(new Set());
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { getNodes, setViewport } = useReactFlow();

  // Static URLs for the icons
  const navigationIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/navigation-icon.svg`;
  const searchIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`;

  // Function to get the great grandparent path ID
  const getGreatGrandParentPathId = (path: Path): number | null => {
    // Get parent path
    const parentBlock = path.parent_blocks[0]?.block_id;
    if (!parentBlock) return null;

    // Find parent path
    const parentPath = paths.find((p) =>
      p.blocks.some((b) => b.id === parentBlock)
    );
    if (!parentPath) return null;

    // Get grandparent path
    const grandParentBlock = parentPath.parent_blocks[0]?.block_id;
    if (!grandParentBlock) return null;

    // Find grandparent path
    const grandParentPath = paths.find((p) =>
      p.blocks.some((b) => b.id === grandParentBlock)
    );
    if (!grandParentPath) return null;

    // Get great grandparent path
    const greatGrandParentBlock = grandParentPath.parent_blocks[0]?.block_id;
    if (!greatGrandParentBlock) return null;

    // Find and return great grandparent path ID
    const greatGrandParentPath = paths.find((p) =>
      p.blocks.some((b) => b.id === greatGrandParentBlock)
    );
    return greatGrandParentPath?.id ?? null;
  };

  // Organize paths
  const { mainPaths, mergePaths } = useMemo(() => {
    const mergeChildPaths = new Set<number>();
    const mainPathsArray: Path[] = [];
    const mergePathsArray: Path[] = [];

    if (!paths || paths.length === 0) {
      return { mainPaths: [], mergePaths: [] };
    }
    // Collect merge paths (avoiding duplicates)
    paths.forEach((path) => {
      path.blocks.forEach((block) => {
        if (block.type === 'MERGE') {
          const child_paths = paths.filter((p) =>
            block.child_paths?.some((childPath) => childPath.path.id === p.id)
          );
          child_paths.forEach((childPath) => {
            if (!mergeChildPaths.has(childPath.id)) {
              mergeChildPaths.add(childPath.id);
              mergePathsArray.push(childPath);
            }
          });
        }
      });
    });

    // Find first path
    paths.forEach((path) => {
      if (path.parent_blocks.length === 0) {
        mainPathsArray.push(path);
      }
    });

    // Process merge paths
    mergePathsArray.forEach((mergePath) => {
      const greatGrandParentId = getGreatGrandParentPathId(mergePath);

      if (!greatGrandParentId) {
        mainPathsArray.push(mergePath);
      } else {
        // Find great grandparent path and add merge path to its last block's child_paths
        const greatGrandParent = paths.find((p) => p.id === greatGrandParentId);
        if (greatGrandParent) {
          const lastBlock =
            greatGrandParent.blocks[greatGrandParent.blocks.length - 1];
          if (!lastBlock.child_paths) {
            lastBlock.child_paths = [];
          }
          if (!lastBlock.child_paths.some((p) => p.path.id === mergePath.id)) {
            // Find parent path (path that contains the parent block)
            const parent_path = paths.find((p) =>
              p.blocks.some(
                (block) => block.id === mergePath.parent_blocks[0]?.block_id
              )
            );

            // Find grandparent path (path that contains the parent's parent block)
            const grandparent_path = paths.find((p) =>
              p.blocks.some(
                (block) => block.id === parent_path?.parent_blocks[0]?.block_id
              )
            );

            // Find position of grandparent in child_paths and insert merge path after it
            if (grandparent_path) {
              const grandparentIndex = lastBlock.child_paths.findIndex(
                (cp) => cp.path_id === grandparent_path.id
              );

              if (grandparentIndex !== -1) {
                // Remove merge path if it exists
                const mergePathIndex = lastBlock.child_paths.findIndex(
                  (cp) => cp.path_id === mergePath.id
                );
                if (mergePathIndex !== -1) {
                  lastBlock.child_paths.splice(mergePathIndex, 1);
                }

                const grandparent_last_block =
                  grandparent_path.blocks[grandparent_path.blocks.length - 1];
                // Get child paths that should be moved to merge path
                const childPathsToMove =
                  grandparent_last_block.child_paths.filter(
                    (childPath) =>
                      !mergePath.parent_blocks.some((pb) => {
                        const lastBlockOfChildPath = paths
                          .find((p) => p.id === childPath.path_id)
                          ?.blocks.slice(-1)[0];
                        return lastBlockOfChildPath?.id === pb.block_id;
                      })
                  );

                // Remove these paths from lastBlock.child_paths
                grandparent_last_block.child_paths =
                  grandparent_last_block.child_paths.filter(
                    (cp) => !childPathsToMove.includes(cp)
                  );
                // Add merge path after grandparent
                lastBlock.child_paths.splice(grandparentIndex + 1, 0, {
                  path: mergePath,
                  path_id: mergePath.id,
                  block_id: lastBlock.id,
                  created_at: new Date().toISOString(),
                  block: lastBlock,
                });

                // Move filtered child paths to merge path's last block
                mergePath.blocks[mergePath.blocks.length - 1].type =
                  BlockEndType.PATH;
                const mergePathLastBlock =
                  mergePath.blocks[mergePath.blocks.length - 1];
                if (!mergePathLastBlock.child_paths) {
                  mergePathLastBlock.child_paths = [];
                }
                mergePathLastBlock.child_paths.push(...childPathsToMove);
                console.log(
                  'mergePathLastBlock.child_paths',
                  mergePathLastBlock.child_paths
                );
              }
            }
          }
        }
      }
    });

    return {
      mainPaths: mainPathsArray,
      mergePaths: mergePathsArray,
    };
  }, [paths]);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  // Find the main path from filtered paths
  const mainPath = mainPaths.find((path) => path.parent_blocks.length === 0);

  // Function to handle block click and zoom to node
  const handleBlockClick = (blockId: number) => {
    const node = getNodes().find((n) => n.id === `block-${blockId}`);
    if (!node) return;

    // Center on node and offset to the left to make room for sidebar
    setViewport(
      {
        x: -(node.position.x - window.innerWidth / 2 + 200),
        y: -(node.position.y - window.innerHeight / 2 + 200),
        zoom: 1,
      },
      { duration: 800 }
    );
  };

  const togglePathVisibility = (pathId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent block click when clicking the toggle
    setCollapsedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pathId)) {
        newSet.delete(pathId);
      } else {
        newSet.add(pathId);
      }
      return newSet;
    });
  };

  // Helper function to check if a block matches the search filter
  const blockMatchesSearch = (block: any) => {
    if (!searchFilter) return true;

    const searchTerm = searchFilter.toLowerCase();
    const blockTitle = (
      block.title ||
      block.step_details ||
      `Block ${block.id}`
    ).toLowerCase();

    return blockTitle.includes(searchTerm);
  };

  // Helper function to check if a path or its children contain matching blocks
  const pathContainsMatchingBlocks = (path: Path): boolean => {
    if (!searchFilter) return true;

    // Check if any direct blocks match
    const hasMatchingBlocks = path.blocks.some(blockMatchesSearch);
    if (hasMatchingBlocks) return true;

    // Check child paths recursively
    const childPaths = path.blocks
      .filter((block) => block.type === 'MERGE' || block.type === 'PATH')
      .flatMap((block) => block.child_paths || [])
      .map((childPath) => paths.find((p) => p.id === childPath.path.id))
      .filter((p): p is Path => p !== undefined);

    return childPaths.some(pathContainsMatchingBlocks);
  };

  const renderPathContent = (path: Path, level: number = 0) => {
    const isPathCollapsed = collapsedPaths.has(path.id);

    // Only render the path if it contains matching blocks or if there's no search filter
    if (!pathContainsMatchingBlocks(path)) {
      return null;
    }

    return (
      <div key={path.id}>
        {path.blocks
          .filter((block) => block.type === 'BEGIN')
          .map((block) => (
            <div
              key={block.id}
              className="p-2 hover:bg-gray-50 rounded-md cursor-pointer w-[250px]"
              onClick={() => handleBlockClick(block.id)}
            >
              <div className="flex items-center gap-2">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-icon.svg`}
                  alt="Branch Icon"
                  className="w-6 h-6 flex-shrink-0"
                />
                <span className="text-sm text-gray-700 whitespace-nowrap overflow-hidden">
                  {path.name}
                </span>
                <button
                  onClick={(e) => togglePathVisibility(path.id, e)}
                  className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
                      isPathCollapsed ? 'chevron-right' : 'chevron-down'
                    }.svg`}
                    alt={isPathCollapsed ? 'Expand' : 'Collapse'}
                    className="w-4 h-4"
                  />
                </button>
              </div>
            </div>
          ))}

        {!isPathCollapsed && (
          <>
            {path.blocks
              .filter(
                (block) =>
                  block.type !== 'LAST' &&
                  block.type !== 'BEGIN' &&
                  blockMatchesSearch(block)
              )
              .map((block) => {
                if (block.type === 'MERGE' || block.type === 'PATH') {
                  if (block.type === 'MERGE') return null;
                  return block.child_paths?.map((childPathConnection) => {
                    const childPath = paths.find(
                      (p) => p.id === childPathConnection.path.id
                    );
                    if (childPath && pathContainsMatchingBlocks(childPath)) {
                      return (
                        <PathContainer
                          key={childPath.id}
                          path={childPath}
                          level={level + 1}
                          renderContent={renderPathContent}
                        />
                      );
                    }
                    return null;
                  });
                }

                return (
                  <div
                    key={block.id}
                    className="p-2 hover:bg-gray-50 rounded-md cursor-pointer w-[250px]"
                    style={{
                      marginLeft: 24,
                    }}
                    onClick={() => handleBlockClick(block.id)}
                  >
                    <div className="flex items-center gap-2">
                      {block.type === 'STEP' && (
                        <img
                          src={
                            block.icon
                              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${block.icon}`
                              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`
                          }
                          alt={block.icon ? 'Block Icon' : 'Default Icon'}
                          className="w-6 h-6 flex-shrink-0"
                        />
                      )}
                      <span className="text-sm text-gray-700 whitespace-nowrap overflow-hidden">
                        {block.title ||
                          block.step_details ||
                          `Block ${block.id}`}
                      </span>
                    </div>

                    {block.child_paths?.map((childPathConnection) => {
                      const childPath = paths.find(
                        (p) => p.id === childPathConnection.path.id
                      );
                      if (childPath) {
                        return (
                          <PathContainer
                            key={childPath.id}
                            path={childPath}
                            level={level + 1}
                            renderContent={renderPathContent}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              })}
          </>
        )}
      </div>
    );
  };

  // Handle resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth + (e.pageX - startX);
      setSidebarWidth(Math.max(250, Math.min(400, newWidth))); // Min 250px, max 800px
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="fixed z-10 bg-white flex h-[93vh] top-[7vh]">
      {/* Sidebar with icons */}
      <div className="w-15 h-full bg-white border border-[#e4e7ec] flex flex-col justify-between">
        <div className="flex flex-col pt-4 px-4 gap-6">
          <div
            className="w-6 h-6 bg-white rounded-md cursor-pointer"
            onClick={toggleSidebar}
          >
            <img
              src={navigationIconUrl}
              alt="Navigation Icon"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Main Sidebar Content */}
      {isSidebarVisible && (
        <div
          ref={sidebarRef}
          className="flex-1 flex flex-col border border-gray-200 relative"
          style={{
            width: sidebarWidth,
            minWidth: '250px',
          }}
        >
          {/* Header Section */}
          <div className="sticky top-0 z-10 px-2 pt-3 pb-7 border-b border-[#e4e7ec] bg-white">
            <div className="self-stretch text-[#101828] text-base font-medium font-['Inter'] leading-normal mb-4">
              Navigation
            </div>
            {/* Search bar */}
            <div className="flex-col justify-start items-start gap-1.5">
              <div className="px-2 py-1 bg-white rounded-md shadow border border-[#d0d5dd] justify-start items-center gap-2 inline-flex">
                <div className="grow shrink basis-0 h-[18px] justify-start items-center gap-2 flex">
                  <div className="w-4 h-4 relative">
                    <img
                      src={searchIconUrl}
                      alt="Search Icon"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search"
                    className="w-[150px] text-[#667085] text-xs font-normal font-['Inter'] leading-[18px] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area with both x and y scrolling */}
          <div className="flex-1 overflow-auto p-4">
            {mainPaths.map((path) => (
              <PathContainer
                key={path.id}
                path={path}
                level={0}
                renderContent={renderPathContent}
              />
            ))}
          </div>

          {/* Resize Handle */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleMouseDown}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4 text-gray-400"
            >
              <path
                d="M22 22L12 12M22 12L12 22"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
