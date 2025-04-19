import React, { useState, useRef, useEffect } from 'react';
import { Folder } from '@/types/workspace';
import FolderDropdown from '@/app/dashboard/components/FolderDropdown';
import { getAssetUrl, SHARED_ASSETS } from '@/app/utils/assetUrls';
import { useColors } from '@/app/theme/hooks';
import { cn } from '@/lib/utils/cn';

interface TabButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isFolder?: boolean;
  folder?: Folder;
  hasSubfolders?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onCreateSubfolder?: (folder: Folder) => void;
  onEditFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => Promise<void>;
  onSelectFolder?: (folder?: Folder) => void;
  emote?: string;
  inSortableContext?: boolean;
}

export const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
  isFolder,
  folder,
  hasSubfolders,
  isExpanded,
  onToggleExpand,
  onCreateSubfolder,
  onEditFolder,
  onDeleteFolder,
  onSelectFolder,
  emote,
  inSortableContext,
}) => {
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colors = useColors();
  const buttonId = `tab-${Math.random().toString(36).substr(2, 9)}`;

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (folder) {
      if (dropdownPosition) {
        onSelectFolder?.(undefined);
        setDropdownPosition(null);
      } else {
        onSelectFolder?.(folder);
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setDropdownPosition({
          top: rect.top + window.scrollY + 30,
          left: rect.left + window.scrollX + 10,
        });
      }
    }
  };

  const handleDropdownAction = async (action: () => void | Promise<void>) => {
    if (folder) {
      onSelectFolder?.(folder);
    }
    await action();
    setDropdownPosition(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onSelectFolder?.(undefined);
        setDropdownPosition(null);
      }
    };

    if (dropdownPosition) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownPosition, onSelectFolder]);

  const chevronIcon = isExpanded ? SHARED_ASSETS.chevronDown : SHARED_ASSETS.chevronRight;

  const buttonStyles = {
    backgroundColor: isActive ? colors['bg-secondary'] : 'transparent',
    borderColor: isActive ? colors['border-secondary'] : 'transparent',
  };

  const hoverStyles = `
    #${buttonId}:not(.active):hover {
      background-color: ${colors['bg-secondary']} !important;
    }
  `;

  return (
    <>
      <style>{hoverStyles}</style>
      <div className={`relative group ${inSortableContext ? '' : 'drag-handle'}`}>
        <div
          id={buttonId}
          role="button"
          tabIndex={0}
          className={cn(
            'w-full px-3 py-1.5 rounded-md flex items-center cursor-pointer transition-colors border',
            isActive && 'active'
          )}
          style={buttonStyles}
          onClick={onClick}
          onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
          <div className="flex items-center gap-2 w-full overflow-hidden">
            {/* Chevron (shows on hover) */}
            {isFolder && hasSubfolders && (
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand?.();
                }}
                onKeyDown={(e) => e.key === 'Enter' && onToggleExpand?.()}
                className={cn(
                  'w-4 h-4 hidden group-hover:block flex-shrink-0 rounded-md opacity-70 hover:opacity-100',
                  'hover:bg-[var(--bg-secondary)]'
                )}
              >
                <img
                  src={getAssetUrl(chevronIcon)}
                  alt="Toggle Subfolders"
                  className="w-4 h-4"
                />
              </div>
            )}

            {/* Folder Icon */}
            <div className={`w-4 h-4 flex-shrink-0 ${hasSubfolders ? 'group-hover:hidden' : ''} flex items-center justify-center`}>
              {emote ? (
                <div className="w-4 h-4 flex items-center justify-center leading-none">
                  {emote}
                </div>
              ) : icon ? (
                <img src={icon} alt={label} className="w-4 h-4" />
              ) : null}
            </div>

            {/* Label */}
            <div className="min-w-0 flex-1 overflow-hidden">
              <span 
                style={{ color: colors['text-secondary'] }}
                className="text-sm font-medium truncate block"
              >
                {label}
              </span>
            </div>
          </div>

          {/* Three dots button */}
          {isFolder && (
            <div
              role="button"
              tabIndex={0}
              onClick={handleDropdownClick}
              onKeyDown={(e) => e.key === 'Enter' && handleDropdownClick(e as any)}
              className={cn(
                'w-5 h-5 relative overflow-hidden hidden group-hover:block ml-auto rounded-md',
                'hover:bg-[var(--bg-secondary)] opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-black.svg`}
                alt="Show Folder Dropdown"
                className="w-5 h-5"
              />
            </div>
          )}
        </div>

        {/* Dropdown Menu */}
        {dropdownPosition && folder && (
          <div
            ref={dropdownRef}
            style={{
              backgroundColor: colors['bg-primary'],
              borderColor: colors['border-secondary'],
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
            className="fixed z-50 w-auto min-w-[200px] rounded-lg overflow-hidden border shadow-lg"
          >
            <FolderDropdown
              onCreateSubfolder={() => handleDropdownAction(() => onCreateSubfolder?.(folder))}
              onDeleteFolder={() => handleDropdownAction(async () => await onDeleteFolder?.(folder))}
              onEditFolder={() => handleDropdownAction(() => onEditFolder?.(folder))}
              parent={folder}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default TabButton;