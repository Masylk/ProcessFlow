'use client';

import React, { useState, useRef } from 'react';
import { Workspace, Folder } from '@/types/workspace';
import FolderDropdown from './FolderDropdown';
import { useColors } from '@/app/theme/hooks';

interface FolderSectionProps {
  activeWorkspace: Workspace;
  onCreateFolder: (parentId?: number) => void;
  onEditFolder: (parentFolder: Folder) => void;
  onCreateSubfolder: (parentFolder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onSelectFolder: (folder?: Folder) => void;
  onSelectFolderView: (folder?: Folder) => void;
  selectedFolder?: Folder;
}

export default function FolderSection({
  activeWorkspace,
  onCreateFolder,
  onEditFolder,
  onCreateSubfolder,
  onDeleteFolder,
  onSelectFolder,
  onSelectFolderView,
  selectedFolder,
}: FolderSectionProps) {
  const colors = useColors();
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onSelectFolder(undefined);
        setDropdownPosition(null);
      }
    };

    const handleScroll = () => {
      onSelectFolder(undefined);
      setDropdownPosition(null);
    };

    const scrollableContainer = scrollableContainerRef.current;

    if (selectedFolder) {
      document.addEventListener('mousedown', handleClickOutside);

      // Attach the scroll listener to the correct container
      if (scrollableContainer) {
        scrollableContainer.addEventListener('scroll', handleScroll, {
          passive: true,
        });
      } else {
        window.addEventListener('scroll', handleScroll, { passive: true });
      }
    }

    return () => {
   
      document.removeEventListener('mousedown', handleClickOutside);

      if (scrollableContainer) {
        scrollableContainer.removeEventListener('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [selectedFolder]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const newExpandedFolders = new Set(prev);
      newExpandedFolders.has(folderId)
        ? newExpandedFolders.delete(folderId)
        : newExpandedFolders.add(folderId);
      return newExpandedFolders;
    });
  };

  const handleDropdownClick = (
    e: React.MouseEvent,
    folderId: number,
    folder: Folder
  ) => {
    e.stopPropagation(); // Prevent toggling folder when clicking dropdown button

    if (selectedFolder && selectedFolder.id === folderId) {
      onSelectFolder(undefined);
      setDropdownPosition(null);
    } else {
      onSelectFolder(folder);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setDropdownPosition({
        top: rect.top + window.scrollY + 30,
        left: rect.left + window.scrollX + 10,
      });
    }
  };

  const handleToggleClick = (e: React.MouseEvent, folder: Folder) => {
    e.stopPropagation();
    toggleFolder(folder.id);
  };

  const handleCreateSubfolder = (parent: Folder) => {
    // Fix the logic
    if (selectedFolder && !expandedFolders.has(selectedFolder.id))
      toggleFolder(selectedFolder.id);
    onCreateSubfolder(parent);
    setDropdownPosition(null);
  };

  const handleOnEditFolder = (folder: Folder) => {
    onEditFolder(folder);    // This opens the edit modal with the correct folder
    setDropdownPosition(null);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const subfolders = activeWorkspace.folders.filter(
      (f) => f.parent_id === folder.id
    );
    const isExpanded = expandedFolders.has(folder.id);
    const isDropdownOpen = selectedFolder && selectedFolder?.id === folder.id;

    return (
      <div
        key={folder.id}
        className="w-full relative"
        style={{ 
          '--hover-bg': colors['bg-quaternary'],
          backgroundColor: isDropdownOpen ? colors['bg-quaternary'] : 'transparent'
        } as React.CSSProperties}
        onClick={(e) => {
          e.stopPropagation();
          onSelectFolderView(folder);
        }}
      >
        <div
          className="flex items-center gap-1 cursor-pointer group relative hover:bg-[var(--hover-bg)] transition-colors duration-200"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          {/* Chevron Icon - Show on hover if has subfolders */}
          {subfolders.length > 0 && (
            <div
              onClick={(e) => handleToggleClick(e, folder)}
              className="w-4 h-4 hidden group-hover:block items-center justify-center"
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${
                  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH
                }/assets/shared_components/${
                  isExpanded ? 'chevron-down.svg' : 'chevron-right-black.svg'
                }`}
                alt="Toggle Subfolders"
                className="w-4 h-4"
              />
            </div>
          )}

          {/* Folder Icon/Emote - Hide on hover if has subfolders */}
          <div className={`w-4 h-4 ${subfolders.length > 0 ? 'group-hover:hidden' : ''} flex items-center justify-center`}>
            {folder.icon_url ? (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${folder.icon_url}`}
                alt="Folder Icon"
                className="w-4 h-4"
              />
            ) : folder.emote ? (
              <div className="w-4 h-4 flex items-center justify-center leading-none">
                {folder.emote}
              </div>
            ) : (
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`}
                alt="Folder Icon"
                className="w-4 h-4"
              />
            )}
          </div>

          {/* Folder Name */}
          <div 
            className="text-sm font-semibold leading-tight flex-1"
            style={{ color: colors['text-primary'] }}
          >
            {folder.name}
          </div>

          {/* Dropdown Button */}
          <button
            onClick={(e) => handleDropdownClick(e, folder.id, folder)}
            className="w-5 h-5 relative overflow-hidden hidden group-hover:block"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal-black.svg`}
              alt="Show Folder Dropdown"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Render Subfolders */}
        {isExpanded && (
          <div className="pl-6">
            {subfolders.map((subfolder) => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={scrollableContainerRef}
      className="p-4 h-[65vh] flex-col justify-start items-start gap-2 inline-flex overflow-auto"
    >
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        <div className="w-52 px-3 justify-between items-center inline-flex">
          <div 
            className="text-sm font-semibold leading-tight"
            style={{ color: colors['text-accent'] }}
          >
            My folders
          </div>
          <button
            onClick={() => onCreateFolder()}
            className="w-5 h-5 relative overflow-hidden"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-dark.svg`}
              alt="Add Folder"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Render Folders */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          {activeWorkspace.folders.length > 0 ? (
            activeWorkspace.folders
              .filter((folder) => folder.parent_id === null) // Only display root folders initially
              .map((folder) => renderFolder(folder))
          ) : (
            <div 
              className="px-3 text-xs"
              style={{ color: colors['text-secondary'] }}
            >
              No folders available.
            </div>
          )}
        </div>
      </div>

      {selectedFolder && dropdownPosition && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-auto min-w-[200px] shadow-lg rounded-md border"
          style={{
            top: dropdownPosition.top * 0.96,
            left: dropdownPosition.left * 0.7,
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary']
          }}
        >
          <FolderDropdown
            onCreateSubfolder={handleCreateSubfolder}
            onDeleteFolder={async () => await onDeleteFolder(selectedFolder)}
            onEditFolder={handleOnEditFolder}
            parent={selectedFolder}
          />
        </div>
      )}
    </div>
  );
}
