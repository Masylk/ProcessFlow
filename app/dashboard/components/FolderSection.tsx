'use client';

import React, { useState } from 'react';
import { Workspace, Folder } from '@/types/workspace';

interface FolderSectionProps {
  activeWorkspace: Workspace;
  onCreateFolder: (
    fn: (name: string, icon_url?: string) => Promise<void>,
    parentId?: number
  ) => void;
  onCreateSubfolder: (
    fn: (name: string, parentId: number, icon_url?: string) => Promise<void>,
    parentFolder: Folder
  ) => void;
}

export default function FolderSection({
  activeWorkspace,
  onCreateFolder,
  onCreateSubfolder,
}: FolderSectionProps) {
  // Local state for folders
  const [folders, setFolders] = useState<Folder[]>(
    activeWorkspace.folders || []
  );

  // Track expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  // Track hovered folders
  // const [hoveredFolder, setHoveredFolder] = useState<number | null>(null);

  // Handler to add a top-level folder (parent_id will be null)
  const handleAddFolder = async (
    name: string,
    icon_url?: string,
    emote?: string
  ) => {
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

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const newExpandedFolders = new Set(prev);
      if (newExpandedFolders.has(folderId)) {
        newExpandedFolders.delete(folderId);
      } else {
        newExpandedFolders.add(folderId);
      }
      return newExpandedFolders;
    });
  };

  const [hoveredParent, setHoveredParent] = useState<number | null>(null);
  const [hoveredSubfolder, setHoveredSubfolder] = useState<number | null>(null);

  const handleMouseEnterParent = (folderId: number) => {
    setHoveredParent(folderId);
    setHoveredSubfolder(null); // Reset subfolder hover when entering a new parent
  };

  const handleMouseLeaveParent = (folderId: number, e: React.MouseEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setHoveredParent(null);
    }
  };

  const handleMouseEnterSubfolder = (folderId: number) => {
    setHoveredSubfolder(folderId);
  };

  const handleMouseLeaveSubfolder = (folderId: number, e: React.MouseEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setHoveredSubfolder(null);
    }
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const subfolders = folders.filter((f) => f.parent_id === folder.id);
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <div key={folder.id} className="w-full">
        <div
          className="flex items-center gap-1 cursor-pointer group relative"
          style={{ paddingLeft: `${level * 1.5}rem` }}
          onClick={() => toggleFolder(folder.id)}
        >
          {/* Chevron Icon - Only visible on hover */}
          <div className="w-4 h-4 hidden group-hover:block items-center justify-center">
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

          {/* Folder Icon / Emote - Hidden on hover */}
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
              </div> // Perfectly centered emoji
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

          {/* Add Subfolder Button */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent toggling when clicking the button
              onCreateSubfolder(handleAddSubfolder, folder);
            }}
            className="w-5 h-5 relative overflow-hidden"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-dark.svg`}
              alt="Add Subfolder"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Render Subfolders If Expanded */}
        {isExpanded && (
          <div className="pl-6">
            {subfolders.map((subfolder) => renderFolder(subfolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Get only top-level folders (those with no parent)
  const topLevelFolders = folders.filter((f) => f.parent_id == null);

  return (
    <div className="p-4 h-[70vh] flex-col justify-start items-start gap-2 inline-flex overflow-auto">
      <div className="self-stretch flex flex-col justify-start items-start gap-2">
        {/* Header with Plus button to add top-level folder */}
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
        {/* Render Folder Items */}
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          {topLevelFolders.length > 0 ? (
            topLevelFolders.map((folder) => renderFolder(folder))
          ) : (
            <div className="px-3 text-xs text-gray-500">
              No folders available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
