import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Block, Path } from '../types';
import { PathContainer } from './PathContainer';
import { usePathsStore } from '../store/pathsStore';
import { BlockEndType, BlockType } from '@/types/block';
import { useTheme, useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import HelpCenterModal from '@/app/dashboard/components/HelpCenterModal';
import DynamicIcon from '@/utils/DynamicIcon';
import { User } from '@/types/user';

interface SidebarProps {
  workspaceId: string;
  workflowId: string;
}

export function Sidebar({ workspaceId, workflowId }: SidebarProps) {
  const { currentTheme } = useTheme();
  const colors = useColors();
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
  const getLastOccurrenceIds = useMemo(() => {
    const lastOccurrenceIds: number[] = [];

    paths.forEach((path) => {
      // Check if any parent block is of type MERGE
      const hasMergeParent = path.parent_blocks.some((pb) =>
        paths.find((p) =>
          p.blocks.find((b) => b.id === pb.block_id && b.type === 'MERGE')
        )
      );

      if (hasMergeParent) {
        // Get the last parent block ID
        const lastParentBlockId =
          path.parent_blocks[path.parent_blocks.length - 1]?.block_id;
        if (lastParentBlockId) {
          lastOccurrenceIds.push(lastParentBlockId);
        }
      }
    });

    return lastOccurrenceIds;
  }, [paths]);
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<number>>(new Set());
  const [sidebarWidth, setSidebarWidth] = useState<number>(300);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { getNodes, setViewport } = useReactFlow();

  // Static URLs for the icons
  const navigationIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/navigation-icon.svg`;
  const supportIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`;
  const settingsIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`;
  const searchIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`;

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  const toggleHelpModal = () => {
    setShowHelpModal((prevState) => !prevState);
  };

  // Find the main path from filtered paths
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
              className="rounded-md cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: 'transparent',
                padding: '2px',
                marginBottom: '2px',
                width: '100%',
              }}
              onClick={() => handleBlockClick(block.id)}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = colors['bg-secondary'];
                e.currentTarget.style.transform = 'translateX(0px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <div 
                className="flex items-center gap-2 py-1.5 px-2 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePathVisibility(path.id, e);
                }}
              >
                <DynamicIcon
                  url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-icon.svg`}
                  size={20}
                  variant="tertiary"
                  className="flex-shrink-0"
                />
                <span
                  className="text-sm whitespace-nowrap overflow-hidden font-medium flex-1"
                  style={{ color: colors['text-primary'] }}
                >
                  {path.name}{' '}
                </span>
                <DynamicIcon
                  url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
                    isPathCollapsed ? 'chevron-right' : 'chevron-down'
                  }.svg`}
                  size={16}
                  variant="tertiary"
                  className="flex-shrink-0"
                />
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
                  return block.child_paths?.map((childPathConnection) => {
                    const childPath = paths.find(
                      (p) => p.id === childPathConnection.path.id
                    );

                    if (childPath && pathContainsMatchingBlocks(childPath)) {
                      // Only render if this is the last occurrence of this path ID
                      if (
                        block.type === 'MERGE' &&
                        !getLastOccurrenceIds.includes(block.id)
                      ) {
                        return null;
                      }
                      return (
                        <PathContainer
                          key={`${childPath.id}-${block.id}`}
                          path={childPath}
                          level={
                            block.type === 'MERGE'
                              ? Math.max(level - 2, -1)
                              : Math.max(level, 0) + 1
                          }
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
                    className="rounded-md cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: 'transparent',
                      marginLeft: 10,
                      padding: '2px',
                      marginBottom: '2px',
                      width: 'calc(100% - 22px)',
                    }}
                    onClick={() => handleBlockClick(block.id)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'];
                      e.currentTarget.style.transform = 'translateX(0px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div className="flex items-center gap-2 py-1.5 px-2">
                      {block.type === 'STEP' && (
                        <DynamicIcon
                          url={
                            block.icon
                              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${block.icon}`
                              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`
                          }
                          size={20}
                          variant="tertiary"
                          className="flex-shrink-0"
                        />
                      )}
                      <span
                        className="text-sm whitespace-nowrap overflow-hidden font-medium flex-1"
                        style={{ color: colors['text-primary'] }}
                      >
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

  // Enhanced resize functionality similar to dashboard sidebar
  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    
    const startWidth = sidebarWidth;
    const startX = mouseDownEvent.clientX;

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const newWidth = startWidth + mouseMoveEvent.clientX - startX;
      setSidebarWidth(Math.max(250, Math.min(400, newWidth))); // Min 250px, max 400px
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [sidebarWidth, setIsResizing]);

  // Helper function to generate button IDs
  const generateButtonId = (name: string) =>
    `sidebar-button-${name}-${Math.random().toString(36).substring(2, 9)}`;

  // Button IDs for hover styling
  const navButtonId = generateButtonId('nav');
  const historyButtonId = generateButtonId('history');
  const supportButtonId = generateButtonId('support');
  const settingsButtonId = generateButtonId('settings');

  // Hover styles
  const hoverStyles = `
    ${navButtonId}:hover, ${historyButtonId}:hover, ${supportButtonId}:hover, ${settingsButtonId}:hover {
      background-color: ${colors['bg-secondary']} !important;
    }
  `;

  // Hover styles for resize handle
  const resizeHandleStyles = `
    .resize-handle:hover {
      background-color: ${colors['border-secondary']} !important;
      opacity: 0.5 !important;
    }
    .resize-handle.resizing {
      background-color: ${colors['accent-primary']} !important;
      opacity: 1 !important;
      box-shadow: 0 0 8px 1px ${colors['accent-primary']}80;
      transition: all 0.15s ease;
    }
  `;

  // Fix linter error by creating a mock user object that matches User type
  const mockUser: Partial<User> = {
    id: parseInt(workspaceId),
    auth_id: workspaceId,
    email: '',
    first_name: '',
    last_name: '',
    full_name: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <>
      <style>{hoverStyles}</style>
      <style>{resizeHandleStyles}</style>
      <div
        className="fixed z-10 flex top-[56px] left-0 h-[calc(100vh-56px)]"
        style={{ backgroundColor: colors['bg-primary'] }}
      >
        {/* Sidebar with icons */}
        <div 
          className="w-fit px-2 h-full flex flex-col justify-between border-r"
          style={{ 
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-primary'],
          }}
        >
          <div className="flex flex-col pt-4 items-center gap-2">
            <ButtonNormal
              variant="tertiary"
              iconOnly
              size="medium"
              leadingIcon={navigationIconUrl}
              onClick={toggleSidebar}
              className={isSidebarVisible ? 'bg-opacity-10' : ''}
            />
            <ButtonNormal
              variant="tertiary"
              iconOnly
              size="medium"
              leadingIcon={navigationIconUrl}
              className="hidden"
            />
          </div>
          <div className="flex flex-col pb-6 items-center gap-2">
            <ButtonNormal
              variant="tertiary"
              iconOnly
              size="medium"
              leadingIcon={supportIconUrl}
              onClick={toggleHelpModal}
            />
            <ButtonNormal
              variant="tertiary"
              iconOnly
              size="medium"
              leadingIcon={settingsIconUrl}
            />
          </div>
        </div>

        {/* Main Sidebar Content */}
        {isSidebarVisible && (
          <div
            ref={sidebarRef}
            className="flex-1 flex flex-col relative border-r"
            style={{
              width: sidebarWidth,
              minWidth: '250px',
              backgroundColor: colors['bg-primary'],
              borderColor: colors['border-primary'],
            }}
          >
            {/* Header Section */}
            <div
              className="sticky top-0 z-10 px-4 pt-4 pb-4 border-b"
              style={{
                backgroundColor: colors['bg-primary'],
                borderColor: colors['border-primary'],
              }}
            >
              <div
                className="text-base font-semibold mb-4"
                style={{ color: colors['text-primary'] }}
              >
                Navigation
              </div>
              {/* Search bar */}
              <div className="relative">
                <InputField
                  type="icon-leading"
                  placeholder="Search"
                  value={searchFilter}
                  onChange={(value) => setSearchFilter(value)}
                  iconUrl={searchIconUrl}
                  size="small"
                  mode={currentTheme === 'light' ? 'light' : 'dark'}
                />
              </div>
            </div>

            {/* Content Area with both x and y scrolling */}
            <div
              className="flex-1 overflow-auto p-2"
              style={{ backgroundColor: colors['bg-primary'] }}
            >
              {mainPath && (
                <PathContainer
                  key={mainPath.id}
                  path={mainPath}
                  level={0}
                  renderContent={renderPathContent}
                />
              )}
            </div>

            {/* Resize Handle */}
            <div
              style={{ 
                backgroundColor: isResizing ? colors['accent-primary'] : 'transparent'
              }}
              className={`absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize resize-handle transition-all ${isResizing ? 'resizing' : ''}`}
              onMouseDown={startResizing}
            />
          </div>
        )}
      </div>

      {/* Help Center Modal */}
      {showHelpModal && (
        <HelpCenterModal onClose={toggleHelpModal} user={mockUser as User} />
      )}
    </>
  );
}
