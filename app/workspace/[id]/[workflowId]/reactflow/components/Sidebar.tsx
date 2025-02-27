import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Block } from '@/types/block';
import { PathObject } from '@/types/sidebar';
import SidebarPath from './SidebarPath';

interface SidebarProps {
  blocks: Block[];
  workspaceId: string;
  workflowId: string;
  onNodeFocus?: (nodeId: string) => void;
  paths?: PathObject[];
  onBlocksReorder?: (newBlocks: Block[]) => void;
}

export function Sidebar({ blocks, workspaceId, workflowId, onNodeFocus, paths, onBlocksReorder }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localBlocks, setLocalBlocks] = useState<Block[]>(blocks || []);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { fitView, setCenter } = useReactFlow();
  
  // Update localBlocks when blocks prop changes
  React.useEffect(() => {
    setLocalBlocks(blocks || []);
  }, [blocks]);
  
  // Construct the icon URLs from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  const toggleIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/align-left-02.svg`;
  const searchIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/search-icon.svg`;

  // Handle sidebar resizing
  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    const startWidth = sidebarWidth;
    const startX = mouseDownEvent.clientX;

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const newWidth = startWidth + mouseMoveEvent.clientX - startX;
      setSidebarWidth(Math.min(Math.max(280, newWidth), 480));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [sidebarWidth]);

  const handleToggleSidebar = () => {
    setIsOpen(prev => !prev);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleNodeClick = useCallback((nodeId: string) => {
    if (onNodeFocus) {
      onNodeFocus(nodeId);
    }
  }, [onNodeFocus]);

  // Handle block reordering
  const handleBlocksReorder = useCallback((reorderedBlocks: Block[]) => {
    setLocalBlocks(reorderedBlocks);
    
    // Call the parent component's reorder handler if provided
    if (onBlocksReorder) {
      onBlocksReorder(reorderedBlocks);
    }
  }, [onBlocksReorder]);

  // Create main path object if no paths are provided
  const mainPath: PathObject = {
    id: 0,
    name: 'Main',
    blocks: localBlocks,
    handleBlocksReorder: async (reorderedBlocks) => {
      handleBlocksReorder(reorderedBlocks);
    }
  };

  return (
    <div className="fixed z-10 bg-white flex h-[93vh] top-[7vh]">
      {/* Sidebar with icons */}
      <div className="w-15 h-full bg-white border border-[#e4e7ec] flex flex-col justify-between">
        <div className="flex flex-col pt-4 px-4 gap-6">
          {/* Navigation Icon */}
          <div
            className="w-6 h-6 bg-white rounded-md cursor-pointer"
            onClick={handleToggleSidebar}
          >
            <img
              src={toggleIconUrl}
              alt="Navigation Icon"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxsaW5lIHgxPSIzIiB5MT0iMTIiIHgyPSIyMSIgeTI9IjEyIj48L2xpbmU+PGxpbmUgeDE9IjMiIHkxPSI2IiB4Mj0iMjEiIHkyPSI2Ij48L2xpbmU+PGxpbmUgeDE9IjMiIHkxPSIxOCIgeDI9IjIxIiB5Mj0iMTgiPjwvbGluZT48L3N2Zz4=';
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Sidebar Content */}
      {isOpen && (
        <div
          ref={sidebarRef}
          className="flex-1 flex flex-col overflow-auto p-0 hide-scrollbar resize-x border border-gray-200 shadow-lg"
          style={{
            minWidth: '250px',
            width: `${sidebarWidth}px`,
            maxWidth: '500px',
            cursor: isResizing ? 'ew-resize' : 'auto'
          }}
        >
          {/* Sidebar Header */}
          <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>
        
          {/* Search Bar */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="h-[26px] flex-col justify-start items-start gap-1.5 flex">
              <div className="px-2 py-1 bg-white rounded-md shadow border border-[#d0d5dd] justify-start items-center gap-2 inline-flex">
                <div className="grow shrink basis-0 h-[18px] justify-start items-center gap-2 flex">
                  <div className="w-4 h-4 relative">
                    <img
                      src={searchIconUrl}
                      alt="Search Icon"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiPjwvY2lyY2xlPjxsaW5lIHgxPSIyMSIgeTE9IjIxIiB4Mj0iMTYuNjUiIHkyPSIxNi42NSI+PC9saW5lPjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search"
                    className="w-[150px] text-[#667085] text-xs font-normal font-['Inter'] leading-[18px] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        
          {/* Content - SidebarPath components */}
          <div className="flex-1 overflow-y-auto p-2">
            {paths && paths.length > 0 ? (
              paths.map(path => (
                <SidebarPath
                  key={path.id}
                  path={{
                    ...path,
                    handleBlocksReorder: path.handleBlocksReorder || (async (blocks) => {
                      if (path.id === 0) {
                        handleBlocksReorder(blocks);
                      }
                    })
                  }}
                  onNodeFocus={handleNodeClick}
                  workspaceId={workspaceId}
                  workflowId={workflowId}
                  displayTitle={true}
                  searchFilter={searchTerm}
                />
              ))
            ) : (
              <SidebarPath
                path={mainPath}
                onNodeFocus={handleNodeClick}
                workspaceId={workspaceId}
                workflowId={workflowId}
                displayTitle={false}
                searchFilter={searchTerm}
              />
            )}
          </div>
        
          {/* Resizer */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-ew-resize bg-gray-300 hover:bg-blue-500 transition-colors"
            onMouseDown={startResizing}
          />
        </div>
      )}
    </div>
  );
} 