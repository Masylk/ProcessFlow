import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import { useReactFlow } from '@xyflow/react';
import { Block, Path } from '../../types';
import { PathContainer } from './PathContainer';
import { usePathsStore } from '../store/pathsStore';
import { BlockEndType, BlockType } from '@/types/block';
import { useTheme, useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import HelpCenterModal from '@/app/dashboard/components/HelpCenterModal';
import { DocumentationModal } from './DocumentationModal';
import SettingsModal from './SettingsModal';
import DynamicIcon from '@/utils/DynamicIcon';
import { User } from '@/types/user';
import { useEditModeStore } from '../store/editModeStore';
import Cookies from 'js-cookie';
import ChatContainer from '@/components/chat/ChatContainer';
import { CustomTooltip } from '@/app/components/CustomTooltip';

interface SidebarProps {
  workspaceId: string;
  workflowId: string;
}

// Add new interface for favorite blocks
interface FavoriteBlock {
  id: number;
  title: string;
  icon?: string;
  pathName: string;
}

// Update the useIsTextTruncated hook
const useIsTextTruncated = () => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const { scrollWidth, clientWidth } = textRef.current;
        setIsTruncated(scrollWidth > clientWidth);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (isTruncated && textRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.right + 8,
        y: rect.top, // Align with the top of the element
      });
      setShowTooltip(true);
    }
  }, [isTruncated]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return {
    textRef,
    isTruncated,
    showTooltip,
    tooltipPosition,
    handleMouseEnter,
    handleMouseLeave,
  };
};

// Add this helper function at the top level of the file, after the imports
const formatDuration = (seconds?: number): string => {
  if (!seconds) return 'Not set';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.length > 0 ? parts.join(' ') : '0m';
};

// Add this new component above Sidebar
interface SidebarBlockRowProps {
  block: any;
  isSelected: boolean;
  onClick: () => void;
  onMouseOver: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOut: (e: React.MouseEvent<HTMLDivElement>) => void;
  level: number;
  hasChildPaths: boolean;
  isPathCollapsed: boolean;
  colors: ReturnType<typeof useColors>;
  currentTheme: string;
  path: Path;
  togglePathVisibility: (pathId: number, event: React.MouseEvent) => void;
  formatDuration: (seconds?: number) => string;
}

const SidebarBlockRow: React.FC<SidebarBlockRowProps> = ({
  block,
  isSelected,
  onClick,
  onMouseOver,
  onMouseOut,
  level,
  hasChildPaths,
  isPathCollapsed,
  colors,
  currentTheme,
  path,
  togglePathVisibility,
  formatDuration,
}) => {
  const {
    textRef,
    isTruncated,
    showTooltip,
    tooltipPosition,
    handleMouseEnter,
    handleMouseLeave,
  } = useIsTextTruncated();

  return (
    <div
      key={block.id}
      className="w-full cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      style={{
        backgroundColor: isSelected
          ? colors['brand-utility-600']
          : 'transparent',
      }}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <div
        className="flex items-center gap-2 h-8 w-full relative"
        style={{
          paddingLeft: level > 0 ? '40px' : '16px',
          paddingRight: '16px',
        }}
      >
        {level > 0 && !hasChildPaths && (
          <>
            <div
              className="absolute left-6 top-0 bottom-0 w-px"
              style={{
                backgroundColor: colors['border-secondary'],
              }}
            />
            <div
              className="absolute left-6 w-4 h-px"
              style={{
                backgroundColor: colors['border-secondary'],
                top: '50%',
              }}
            />
          </>
        )}
        {block.type === 'STEP' && (
          <>
            {hasChildPaths && (
              <div
                className="cursor-pointer"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  togglePathVisibility(path.id, e);
                }}
              >
                <DynamicIcon
                  url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
                    isPathCollapsed ? 'chevron-right' : 'chevron-down'
                  }.svg`}
                  size={16}
                  variant="tertiary"
                  className="flex-shrink-0"
                />
              </div>
            )}
            <DynamicIcon
              url={
                block.icon
                  ? block.icon.startsWith('https://cdn.brandfetch.io/')
                    ? block.icon
                    : block.signedIconUrl
                  : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/container.svg`
              }
              size={20}
              color="inherit"
              className="flex-shrink-0"
            />
          </>
        )}
        {block.type === 'DELAY' && (
          <DynamicIcon
            url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
              block.delay_type === 'WAIT_FOR_EVENT'
                ? 'calendar-clock-1.svg'
                : 'clock-stopwatch-1.svg'
            }`}
            size={20}
            color="inherit"
            className="flex-shrink-0"
          />
        )}
        <span
          ref={textRef}
          className="text-sm whitespace-nowrap overflow-hidden text-ellipsis font-medium flex-1"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            color: isSelected
              ? currentTheme === 'light'
                ? colors['text-primary']
                : colors['text-white']
              : colors['text-primary'],
          }}
        >
          {block.type === 'DELAY'
            ? block.delay_type === 'WAIT_FOR_EVENT'
              ? `Wait for Event: ${block.delay_event || 'Not set'}`
              : `Duration Delay: ${formatDuration(block.delay_seconds || undefined)}`
            : block.title || `Block ${block.id}`}
        </span>
        {isTruncated && (
          <div
            style={{
              position: 'fixed',
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              transform: 'none',
            }}
            className="pointer-events-none"
          >
            <CustomTooltip
              text={block.title || `Block ${block.id}`}
              show={showTooltip}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export function Sidebar({ workspaceId, workflowId }: SidebarProps) {
  const { currentTheme } = useTheme();
  const colors = useColors();
  const { selectedNodeId, setEditMode } = useEditModeStore();
  const originalPaths = usePathsStore((state) => state.paths);
  const paths = useMemo(
    () =>
      originalPaths?.map((path) => ({
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
        parent_blocks:
          path.parent_blocks?.map((pb) => ({
            ...pb,
            block: { ...pb.block },
          })) ?? [],
      })) ?? [], // Return empty array if originalPaths is undefined
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
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);
  const [showDocNotification, setShowDocNotification] = useState<boolean>(
    !Cookies.get('hasSeenDocumentation')
  );
  const [showStars, setShowStars] = useState<boolean>(false);
  const [favoriteBlocks, setFavoriteBlocks] = useState<FavoriteBlock[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const historyMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const historyButtonRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { getNodes, setViewport } = useReactFlow();

  // Static URLs for the icons
  const navigationIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/navigation-icon.svg`;
  const supportIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`;
  const settingsIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`;
  const searchIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`;
  const bookIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/book-open-01.svg`;
  const starIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/stars-01.svg`;

  // Add new handlers for menu toggling
  const handleHistoryMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showHistoryMenu) {
      setShowHistoryMenu(false);
    } else {
      setShowMenu(false);
      setShowHistoryMenu(true);
    }
  };

  const handleDotsMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showMenu) {
      setShowMenu(false);
    } else {
      setShowHistoryMenu(false);
      setShowMenu(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the menu and its button
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
      if (
        historyMenuRef.current &&
        !historyMenuRef.current.contains(event.target as Node) &&
        historyButtonRef.current &&
        !historyButtonRef.current.contains(event.target as Node)
      ) {
        setShowHistoryMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
    // Reset stars view when closing sidebar
    if (showStars) {
      setShowStars(false);
    }
  };

  const toggleHelpModal = () => {
    setShowHelpModal((prevState) => !prevState);
  };

  const toggleDocModal = () => {
    setShowDocModal((prevState) => !prevState);
  };

  const toggleSettingsModal = () => {
    setIsSettingsModalOpen((prevState) => !prevState);
  };

  // Toggle stars view
  const toggleStarsView = () => {
    setShowStars((prev) => !prev);
    // Ensure sidebar is visible when showing stars
    if (!isSidebarVisible) {
      setIsSidebarVisible(true);
    }
  };

  // Handle tab switch
  const handleTabSwitch = (tab: 'navigation' | 'stars') => {
    if (tab === 'navigation' && isSidebarVisible && !showStars) {
      // If clicking navigation tab while it's already active, close the sidebar
      setIsSidebarVisible(false);
    } else if (tab === 'stars' && isSidebarVisible && showStars) {
      // If clicking stars tab while it's already active, close the sidebar
      setIsSidebarVisible(false);
    } else {
      if (tab === 'navigation') {
        setShowStars(false);
      } else {
        setShowStars(true);
      }
      // Always ensure sidebar is visible when switching tabs
      if (!isSidebarVisible) {
        setIsSidebarVisible(true);
      }
    }
  };

  // Toggle favorite status for a block
  const toggleFavorite = (block: any, pathName: string) => {
    setFavoriteBlocks((prev) => {
      const exists = prev.some((fb) => fb.id === block.id);
      if (exists) {
        return prev.filter((fb) => fb.id !== block.id);
      } else {
        return [
          ...prev,
          {
            id: block.id,
            title: block.title || `Block ${block.id}`,
            icon: block.icon,
            pathName,
          },
        ];
      }
    });
  };

  // Check if a block is favorited
  const isFavorite = (blockId: number) => {
    return favoriteBlocks.some((fb) => fb.id === blockId);
  };

  // Render favorites content
  const renderFavoritesContent = () => {
    return (
      <div
        className="w-full h-full flex flex-col"
        style={{ backgroundColor: colors['bg-primary'] }}
      >
        {/* Header with action buttons */}
        <div
          className="sticky top-0 z-10 flex justify-end items-center gap-2 p-2 border-b"
          style={{ borderColor: colors['border-primary'] }}
        >
          <ButtonNormal
            variant="tertiary"
            iconOnly
            size="small"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon.svg`}
            onClick={() => {}}
            className="opacity-50 hover:opacity-100 transition-opacity"
          />
          <div className="relative">
            <div ref={historyButtonRef}>
              <ButtonNormal
                variant="tertiary"
                iconOnly
                size="small"
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/clock-rewind.svg`}
                onClick={handleHistoryMenuClick}
                className="opacity-50 hover:opacity-100 transition-opacity !w-8 !h-8 !p-0 flex items-center justify-center"
              />
            </div>
            {showHistoryMenu && (
              <div
                ref={historyMenuRef}
                className="absolute right-0 w-[192px] rounded-md border shadow-lg z-50"
                style={{
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-primary'],
                }}
              >
                <div
                  className="p-1.5 border-b"
                  style={{ borderColor: colors['border-primary'] }}
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-transparent text-xs px-1.5 py-1"
                    style={{ color: colors['text-secondary'] }}
                  />
                </div>
                <div className="p-1.5 flex flex-col gap-1">
                  <div
                    className="group flex items-center justify-between w-full px-1.5 py-1.5 rounded text-xs transition-colors"
                    style={{ color: colors['text-secondary'] }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">Create new paths</span>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-2 flex-shrink-0 ml-2">
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                    </div>
                  </div>
                  <div
                    className="group flex items-center w-full px-1.5 py-1.5 rounded text-xs transition-colors"
                    style={{ color: colors['text-secondary'] }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">
                        Build a specific path for HR
                      </span>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-2 flex-shrink-0 ml-2">
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                    </div>
                  </div>
                  <div
                    className="group flex items-center justify-between w-full px-1.5 py-1.5 rounded text-xs transition-colors"
                    style={{ color: colors['text-secondary'] }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <span>Optimize this process</span>
                    <div className="hidden group-hover:flex items-center gap-2">
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                    </div>
                  </div>
                  <div
                    className="group flex items-center justify-between w-full px-1.5 py-1.5 rounded text-xs transition-colors"
                    style={{ color: colors['text-secondary'] }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <span>Add a delay between</span>
                    <div className="hidden group-hover:flex items-center gap-2">
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                    </div>
                  </div>
                  <div
                    className="group flex items-center justify-between w-full px-1.5 py-1.5 rounded text-xs transition-colors"
                    style={{ color: colors['text-secondary'] }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">Create new paths</span>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-2 flex-shrink-0 ml-2">
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                      <ButtonNormal
                        variant="tertiary"
                        iconOnly
                        size="small"
                        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                        onClick={() => {}}
                        className="!bg-transparent hover:!bg-opacity-10 !w-3 !h-3 !p-0 flex items-center justify-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <div ref={menuButtonRef}>
              <ButtonNormal
                variant="tertiary"
                iconOnly
                size="small"
                leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
                onClick={handleDotsMenuClick}
                className="menu-trigger opacity-50 hover:opacity-100 transition-opacity !w-8 !h-8 !p-0 flex items-center justify-center"
              />
            </div>
            {showMenu && (
              <div
                ref={menuRef}
                className="absolute right-0 w-[180px] rounded-md border shadow-lg z-50"
                style={{
                  backgroundColor: colors['bg-primary'],
                  borderColor: colors['border-primary'],
                }}
              >
                <div className="p-1.5 flex flex-col gap-1">
                  <button
                    className="flex items-center w-full px-1.5 py-1.5 rounded text-xs transition-colors"
                    style={{ color: colors['text-secondary'] }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                    onClick={() => setShowMenu(false)}
                  >
                    Close all chats
                  </button>
                  <button
                    className="flex items-center w-full px-1.5 py-1.5 rounded text-xs transition-colors"
                    style={{ color: colors['text-secondary'] }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                    onClick={() => setShowMenu(false)}
                  >
                    Report feedback
                  </button>
                  <button
                    className="flex items-center w-full px-1.5 py-1.5 rounded text-xs transition-colors"
                    style={{ color: colors['text-secondary'] }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        colors['bg-secondary'])
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                    onClick={() => setShowMenu(false)}
                  >
                    Chats settings
                  </button>
                </div>
              </div>
            )}
          </div>
          <ButtonNormal
            variant="tertiary"
            iconOnly
            size="small"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/x-close-icon.svg`}
            onClick={() => {
              setShowStars(false);
              setIsSidebarVisible(false);
            }}
            className="opacity-50 hover:opacity-100 transition-opacity"
          />
        </div>

        {/* Show ChatContainer directly */}
        <div className="flex-1 overflow-hidden">
          <ChatContainer />
        </div>
      </div>
    );
  };

  useEffect(() => {
    // Additional initialization logic if needed
  }, []);

  const handleDocModalOpen = () => {
    setShowDocModal(true);
    setShowDocNotification(false);

    // Set a session cookie (expires when browser is closed)
    Cookies.set('hasSeenDocumentation', 'true');
  };

  // Find the main path from filtered paths
  const mainPath = paths.find((path) => path.parent_blocks.length === 0);
  // Function to handle block click and zoom to node
  const handleBlockClick = useCallback(
    (blockId: number) => {
      // Set the selected node ID in the store
      setEditMode(true, blockId.toString());

      // Find the node and zoom to it
      const nodeId = `block-${blockId}`;
      const node = getNodes().find((n) => n.id === nodeId);
      if (node) {
        setViewport(
          {
            x: -(node.position.x - window.innerWidth / 2 + 400),
            y: -(node.position.y - window.innerHeight / 2 + 200),
            zoom: 1,
          },
          { duration: 800 }
        );
      }
    },
    [getNodes, setViewport, setEditMode]
  );

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
    const blockTitle = (block.title || `Block ${block.id}`).toLowerCase();

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

  // Helper function to check if a block is selected
  const isBlockSelected = useCallback(
    (blockId: number) => {
      // Handle both formats: with and without 'block-' prefix
      return (
        selectedNodeId === `block-${blockId}` ||
        selectedNodeId === blockId.toString()
      );
    },
    [selectedNodeId]
  );

  const renderPathContent = (path: Path, level: number = 0) => {
    const isPathCollapsed = collapsedPaths.has(path.id);

    // Only render the path if it contains matching blocks or if there's no search filter
    if (!pathContainsMatchingBlocks(path)) {
      return null;
    }

    return (
      <div key={path.id} className="w-full">
        {/* BEGIN blocks */}
        {path.blocks
          .filter((block) => block.type === 'BEGIN')
          .map((block) => {
            const {
              textRef,
              isTruncated,
              showTooltip,
              tooltipPosition,
              handleMouseEnter,
              handleMouseLeave,
            } = useIsTextTruncated();
            return (
              <div
                key={block.id}
                className="w-full cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                style={{
                  backgroundColor: isBlockSelected(block.id)
                    ? colors['brand-utility-600']
                    : 'transparent',
                }}
                onClick={() => handleBlockClick(block.id)}
                onMouseOver={(e) => {
                  if (!isBlockSelected(block.id)) {
                    e.currentTarget.style.backgroundColor =
                      colors['bg-secondary'];
                  }
                }}
                onMouseOut={(e) => {
                  if (!isBlockSelected(block.id)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div
                  className="flex items-center gap-2 h-8 px-4 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePathVisibility(path.id, e);
                  }}
                >
                  <DynamicIcon
                    url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
                      isPathCollapsed ? 'chevron-right' : 'chevron-down'
                    }.svg`}
                    size={16}
                    variant="tertiary"
                    className="flex-shrink-0"
                  />
                  <DynamicIcon
                    url={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-icon.svg`}
                    size={20}
                    variant="tertiary"
                    className="flex-shrink-0"
                  />
                  <span
                    ref={textRef}
                    className="text-sm whitespace-nowrap overflow-hidden text-ellipsis font-medium flex-1"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      color: isBlockSelected(block.id)
                        ? colors['text-primary']
                        : colors['text-primary'],
                    }}
                  >
                    {path.name}
                  </span>
                  {isTruncated && (
                    <div
                      style={{
                        position: 'fixed',
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: 'none',
                      }}
                      className="pointer-events-none"
                    >
                      <CustomTooltip text={path.name} show={showTooltip} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

        {/* Other blocks */}
        {!isPathCollapsed && (
          <div className="w-full">
            <div className="relative w-full">
              {/* Vertical line for the entire level */}
              {level > 0 && (
                <div
                  className="absolute left-6 top-0 bottom-0 w-px"
                  style={{ backgroundColor: colors['border-secondary'] }}
                />
              )}

              {path.blocks
                .filter(
                  (block) =>
                    block.type !== 'LAST' &&
                    block.type !== 'BEGIN' &&
                    blockMatchesSearch(block)
                )
                .map((block, index) => {
                  if (block.type === 'MERGE' || block.type === 'PATH') {
                    return block.child_paths?.map((childPathConnection) => {
                      const childPath = paths.find(
                        (p) => p.id === childPathConnection.path.id
                      );

                      if (childPath && pathContainsMatchingBlocks(childPath)) {
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

                  const hasChildPaths =
                    block.child_paths && block.child_paths.length > 0;

                  return (
                    <SidebarBlockRow
                      key={block.id}
                      block={block}
                      isSelected={isBlockSelected(block.id)}
                      onClick={() => handleBlockClick(block.id)}
                      onMouseOver={(e) => {
                        if (!isBlockSelected(block.id)) {
                          e.currentTarget.style.backgroundColor =
                            colors['bg-secondary'];
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isBlockSelected(block.id)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                      level={level}
                      hasChildPaths={!!hasChildPaths}
                      isPathCollapsed={isPathCollapsed}
                      colors={colors}
                      currentTheme={currentTheme}
                      path={path}
                      togglePathVisibility={togglePathVisibility}
                      formatDuration={formatDuration}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced resize functionality similar to dashboard sidebar
  const startResizing = useCallback(
    (mouseDownEvent: React.MouseEvent) => {
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
    },
    [sidebarWidth, setIsResizing]
  );

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
      {/* Custom styles for animation */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(78, 107, 215, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(78, 107, 215, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(78, 107, 215, 0);
          }
        }
        
        .pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
      <div
        className="fixed z-10 flex top-[56px] left-0 h-[calc(100vh-56px)]"
        style={{ backgroundColor: colors['bg-primary'] }}
      >
        {/* Sidebar with icons */}
        <div
          className="w-fit px-2 h-full flex flex-col justify-between border-r relative"
          style={{
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-primary'],
          }}
        >
          <div className="flex flex-col pt-4 items-center gap-2">
            <ButtonNormal
              variant={
                isSidebarVisible && !showStars ? 'secondary' : 'tertiary'
              }
              iconOnly
              size="medium"
              leadingIcon={navigationIconUrl}
              onClick={() => handleTabSwitch('navigation')}
              className="transition-all duration-200"
              style={{
                backgroundColor:
                  isSidebarVisible && !showStars
                    ? colors['bg-secondary']
                    : 'transparent',
              }}
            />
            <ButtonNormal
              variant={showStars ? 'secondary' : 'tertiary'}
              iconOnly
              size="medium"
              leadingIcon={starIconUrl}
              onClick={() => handleTabSwitch('stars')}
              className="transition-all duration-200 hidden"
              style={{
                backgroundColor: showStars
                  ? colors['bg-secondary']
                  : 'transparent',
              }}
            />
          </div>
          <div className="flex flex-col pb-6 items-center gap-2">
            {/* Button with notification */}
            <div className="relative">
              <ButtonNormal
                variant="tertiary"
                iconOnly
                size="medium"
                leadingIcon={bookIconUrl}
                onClick={handleDocModalOpen}
              />

              {showDocNotification && (
                <div
                  className="pulse"
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#4e6bd7',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px 2px #4e6bd7',
                    zIndex: 9999,
                  }}
                />
              )}
            </div>
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
              onClick={toggleSettingsModal}
            />
          </div>
        </div>

        {/* Main Sidebar Content */}
        {isSidebarVisible && (
          <div
            ref={sidebarRef}
            className="flex-1 flex flex-col relative border-r transform transition-all duration-300 ease-out animate-in slide-in-from-left-0"
            style={{
              width: sidebarWidth,
              minWidth: '250px',
              backgroundColor: colors['bg-primary'],
              borderColor: colors['border-primary'],
            }}
          >
            {/* Header Section - Only show when not in stars view */}
            {!showStars && (
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
            )}

            {/* Content Area with both x and y scrolling */}
            <div
              className="flex-1 overflow-auto"
              style={{ backgroundColor: colors['bg-primary'] }}
            >
              {showStars
                ? renderFavoritesContent()
                : mainPath && (
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
                backgroundColor: isResizing
                  ? colors['accent-primary']
                  : 'transparent',
              }}
              className={`absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize resize-handle transition-all ${isResizing ? 'resizing' : ''}`}
              onMouseDown={startResizing}
            />
          </div>
        )}
      </div>

      {/* Help Center Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[9999]">
          <HelpCenterModal onClose={toggleHelpModal} user={mockUser as User} />
        </div>
      )}

      {/* Documentation Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-[9999]">
          <DocumentationModal onClose={toggleDocModal} />
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && <SettingsModal onClose={toggleSettingsModal} />}
    </>
  );
}
