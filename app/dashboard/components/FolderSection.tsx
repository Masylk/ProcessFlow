'use client';

import React, { useState } from 'react';
import { Workspace, Folder } from '@/types/workspace';

interface FolderSectionProps {
  activeWorkspace: Workspace;
  onCreateFolder: (
    fn: () => Promise<void> | ((parentId: number) => Promise<void>)
  ) => void;
}

export default function FolderSection({
  activeWorkspace,
  onCreateFolder,
}: FolderSectionProps) {
  // Local state for folders (assumes activeWorkspace.folders is an array of Folder)
  const [folders, setFolders] = useState<Folder[]>(
    activeWorkspace.folders || []
  );

  // Handler to add a top-level folder (parent_id will be null)
  const handleAddFolder = async () => {
    try {
      const res = await fetch('/api/workspaces/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Folder',
          workspace_id: activeWorkspace.id,
          team_tags: [],
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
  const handleAddSubfolder = async (parentId: number) => {
    try {
      const res = await fetch('/api/workspaces/subfolders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Subfolder',
          workspace_id: activeWorkspace.id,
          parent_id: parentId,
          team_tags: [],
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

  // Recursive function to render a folder and its subfolders
  const renderFolder = (folder: Folder, level: number = 0) => {
    // Get subfolders by filtering folders with parent_id equal to current folder's id
    const subfolders = folders.filter((f) => f.parent_id === folder.id);

    return (
      <div key={folder.id} className="w-full">
        <div
          className="flex items-center gap-1"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <div className="w-5 text-center text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
            📁
          </div>
          <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight flex-1">
            {folder.name}
          </div>
          <button
            onClick={() => handleAddSubfolder(folder.id)}
            className="w-5 h-5 relative overflow-hidden"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-dark.svg`}
              alt="Add Subfolder"
              className="w-5 h-5"
            />
          </button>
        </div>
        {subfolders.map((subfolder) => renderFolder(subfolder, level + 1))}
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
