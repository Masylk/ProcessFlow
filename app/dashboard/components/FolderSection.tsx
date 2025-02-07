'use client';

import React, { useState, useRef } from 'react';
import { Workspace, Folder } from '@/types/workspace';
import FolderDropdown from './FolderDropdown';

interface FolderSectionProps {
  activeWorkspace: Workspace;
  onCreateFolder: (
    fn: (name: string, icon_url?: string) => Promise<void>,
    parentId?: number
  ) => void;
  onEditFolder: (
    fn: (name: string, icon_url?: string, emote?: string) => Promise<void>,
    parentFolder: Folder
  ) => void;
  onCreateSubfolder: (
    fn: (name: string, parentId: number, icon_url?: string) => Promise<void>,
    parentFolder: Folder
  ) => void;
  onSelectFolder: (folder: Folder) => void;
}

export default function FolderSection({
  activeWorkspace,
  onCreateFolder,
  onEditFolder,
  onCreateSubfolder,
  onSelectFolder,
}: FolderSectionProps) {
  const [folders, setFolders] = useState<Folder[]>(
    activeWorkspace.folders || []
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
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
        setSelectedFolderId(null);
        setSelectedFolder(null);
        setDropdownPosition(null);
      }
    };

    const handleScroll = () => {
      setSelectedFolderId(null);
      setSelectedFolder(null);
      setDropdownPosition(null);
    };

    const scrollableContainer = scrollableContainerRef.current;

    if (selectedFolderId !== null) {
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
  }, [selectedFolderId]);

  // Handler to add a top-level folder (parent_id will be null)
  const handleAddFolder = async (
    name: string,
    icon_url?: string,
    emote?: string
  ) => {
    console.log('adding root folder');
    try {
      const res = await fetch('/api/workspaces/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          workspace_id: activeWorkspace.id,
          team_tags: [],
          icon_url,
          emote,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add folder');
      }

      const newFolder: Folder = await res.json();
      setFolders([...folders, newFolder]);
    } catch (error) {
      console.error('Error adding folder:', error);
    }
  };

  // Handler to add a subfolder with a given parent folder id
  const handleAddSubfolder = async (
    name: string,
    parentId: number,
    icon_url?: string,
    emote?: string
  ) => {
    if (selectedFolderId) toggleFolder(selectedFolderId);
    console.log('adding subfolder for: ' + parentId);
    try {
      const res = await fetch('/api/workspaces/subfolders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          workspace_id: activeWorkspace.id,
          parent_id: parentId,
          team_tags: [],
          icon_url,
          emote,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add subfolder');
      }

      const newSubfolder: Folder = await res.json();
      setFolders([...folders, newSubfolder]);
    } catch (error) {
      console.error('Error adding subfolder:', error);
    }
  };

  const closeDropdown = () => {
    setSelectedFolder(null);
    setSelectedFolderId(null);
    setDropdownPosition(null);
  };

  const handleEditFolder = async (
    name: string,
    icon_url?: string | null,
    emote?: string | null
  ) => {
    if (selectedFolderId === null) return;

    try {
      const response = await fetch(
        `/api/workspaces/folders/${selectedFolderId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, icon_url, emote }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update folder');
      }

      const updatedFolder: Folder = await response.json();
      console.log('Folder updated successfully:', updatedFolder);

      // Update state with the modified folder
      setFolders((prevFolders) =>
        prevFolders.map((folder) =>
          folder.id === selectedFolderId
            ? { ...folder, ...updatedFolder }
            : folder
        )
      );
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  const handleDeleteFolder = async () => {
    console.log('calling handledeletefolder');
    if (selectedFolderId) {
      try {
        const response = await fetch(
          `/api/workspaces/folders/${selectedFolderId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete folder');
        }

        const data = await response.json();
        console.log('Folder deleted successfully:', data);

        setFolders((prevFolders) =>
          prevFolders.filter((folder) => folder.id !== selectedFolderId)
        );

        closeDropdown();
        // Optionally, refresh the UI or update state
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

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

    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
      setSelectedFolder(null);
      setDropdownPosition(null);
    } else {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setSelectedFolderId(folderId);
      setSelectedFolder(folder);
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
    onCreateSubfolder(handleAddSubfolder, parent);
    setDropdownPosition(null);
  };

  const handleOnEditFolder = (folder: Folder) => {
    onEditFolder(handleEditFolder, folder);
    setDropdownPosition(null);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const subfolders = folders.filter((f) => f.parent_id === folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const isDropdownOpen = selectedFolderId === folder.id;

    return (
      <div
        key={folder.id}
        className="w-full relative hover:bg-[#F9FAFB]"
        onClick={(e) => {
          e.stopPropagation();
          onSelectFolder(folder);
        }}
      >
        <div
          className="flex items-center gap-1 cursor-pointer group relative"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          {/* Chevron Icon */}
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

          {/* Folder Icon */}
          <div className="w-4 h-4 group-hover:hidden flex items-center justify-center">
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
          <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight flex-1">
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
          <div className="text-[#667085] text-sm font-semibold font-['Inter'] leading-tight">
            My folders
          </div>
          <button
            onClick={() => onCreateFolder(handleAddFolder)}
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
          {folders.length > 0 ? (
            folders
              .filter((folder) => folder.parent_id === null) // Only display root folders initially
              .map((folder) => renderFolder(folder))
          ) : (
            <div className="px-3 text-xs text-gray-500">
              No folders available.
            </div>
          )}
        </div>
      </div>

      {/* Folder Dropdown - Positioned Absolutely */}
      {selectedFolderId !== null && selectedFolder && dropdownPosition && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-auto min-w-[200px] bg-white shadow-lg rounded-md border border-gray-300"
          style={{
            top: dropdownPosition.top * 0.96,
            left: dropdownPosition.left * 0.7,
          }}
        >
          <FolderDropdown
            onCreateSubfolder={handleCreateSubfolder}
            onDeleteFolder={handleDeleteFolder}
            onEditFolder={handleOnEditFolder}
            parent={selectedFolder}
          />
        </div>
      )}
    </div>
  );
}
