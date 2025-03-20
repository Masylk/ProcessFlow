import React, { useState, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Path } from '../types';
import { PathContainer } from './PathContainer';

interface SidebarProps {
  paths: Path[];
  workspaceId: string;
  workflowId: string;
}

export function Sidebar({ paths, workspaceId, workflowId }: SidebarProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<number>>(new Set());
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { getNodes, setViewport } = useReactFlow();

  // Static URLs for the icons
  const navigationIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/navigation-icon.svg`;
  const searchIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`;

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  // Find the main path (path with no parent blocks)
  const mainPath = paths.find((path) => path.parent_blocks.length === 0);

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

  const renderPathContent = (path: Path, level: number = 0) => {
    const isPathCollapsed = collapsedPaths.has(path.id);

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
                (block) => block.type !== 'LAST' && block.type !== 'BEGIN'
              )
              .map((block) => {
                if (block.type === 'MERGE' || block.type === 'PATH') {
                  return block.child_paths?.map((childPathConnection) => {
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
            {mainPath && (
              <PathContainer
                path={mainPath}
                level={0}
                renderContent={renderPathContent}
              />
            )}
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
