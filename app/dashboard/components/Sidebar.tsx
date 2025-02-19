'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import WorkspaceDropdownMenu from './WorkspaceDropdownMenu';
import FolderSection from './FolderSection';
import { Folder, Workspace } from '@/types/workspace';
import { User } from '@/types/user';
import TabButton from '@/app/components/TabButton';
import { cache } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

interface SidebarProps {
  workspaces: Workspace[];
  userEmail: string;
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  onCreateFolder: (parentId?: number) => void;
  onEditFolder: (parentFolder: Folder) => void;
  onCreateSubfolder: (parentFolder: Folder) => void;
  onDeleteFolder: (folder: Folder) => Promise<void>;
  user: User | null;
  onSelectFolder: (folder?: Folder) => void;
  onSelectFolderView: (folder?: Folder) => void;
  onOpenUserSettings: () => void;
  onOpenHelpCenter: () => void;
  selectedFolder?: Folder;
}

export default function Sidebar({
  workspaces,
  userEmail,
  activeWorkspace,
  setActiveWorkspace,
  onCreateFolder,
  onEditFolder,
  onCreateSubfolder,
  onDeleteFolder,
  user,
  onSelectFolder,
  onSelectFolderView,
  onOpenUserSettings,
  onOpenHelpCenter,
  selectedFolder,
}: SidebarProps) {
  const [activeTabId, setActiveTabId] = useState<string | null>('flows');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const folderContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    const startWidth = sidebarWidth;
    const startX = mouseDownEvent.clientX;

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const newWidth = startWidth + mouseMoveEvent.clientX - startX;
      setSidebarWidth(Math.min(Math.max(240, newWidth), 480));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [sidebarWidth]);

  const handleTabClick = (tabId: string | null, folder?: Folder) => {
    setActiveTabId(tabId);
    if (folder) {
      onSelectFolder(folder);
      onSelectFolderView(folder);
    } else {
      onSelectFolderView(undefined);
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

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const closeDropDown = () => {
    setDropdownVisible(false);
  };

  const renderFolderWithSubfolders = (folder: Folder) => {
    const isExpanded = expandedFolders.has(folder.id);
    const subfolders = activeWorkspace.folders.filter(
      (f) => f.parent_id === folder.id
    );

    let folderIcon;
    if (folder.icon_url) {
      folderIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${folder.icon_url}`;
    } else {
      folderIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
    }

    return (
      <div key={folder.id} className="mt-2 max-w-full">
        <TabButton
          icon={folder.emote ? '' : folderIcon}
          label={folder.name}
          emote={folder.emote}
          isActive={activeTabId === `folder-${folder.id}`}
          onClick={() => handleTabClick(`folder-${folder.id}`, folder)}
          isFolder={true}
          folder={folder}
          onCreateSubfolder={onCreateSubfolder}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
          hasSubfolders={subfolders.length > 0}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleFolder(folder.id)}
        />
        
        {isExpanded && subfolders.length > 0 && (
          <div className="ml-4">
            {subfolders.map((subfolder) => renderFolderWithSubfolders(subfolder))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div 
        className="bg-white border-r border-[#e4e7ec] flex flex-col h-screen relative select-text"
        style={{ 
          width: `${sidebarWidth}px`,
          minWidth: "240px",
          maxWidth: "480px",
          userSelect: isResizing ? 'none' : 'text'
        }}
      >
        {/* Sidebar Header */}
        <div className="h-[72px] w-60 px-4 py-3 flex-col justify-start items-start inline-flex">
          <div
            onClick={toggleDropdown}
            className="self-stretch px-3 py-2.5 cursor-pointer bg-white rounded-md border border-[#e4e7ec] flex justify-between items-center overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-start gap-2.5">
                <div className="flex justify-start items-start ">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{
                      backgroundColor:
                        activeWorkspace.background_colour || '#4299E1',
                    }}
                  >
                    {activeWorkspace.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              {/* Display activeWorkspace name */}
              <div className="relative flex flex-col px-0.5">
                <div className="h-4 text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                  {activeWorkspace.name}
                </div>
              </div>
              {dropdownVisible && (
                <div className="absolute top-14 left-4 mt-2 z-10">
                  <WorkspaceDropdownMenu
                    userEmail={userEmail}
                    workspaces={workspaces}
                    activeWorkspace={activeWorkspace}
                    setActiveWorkspace={setActiveWorkspace}
                    onClose={closeDropDown}
                  />
                </div>
              )}
            </div>
            <div className="relative w-5 h-5 overflow-hidden" />
          </div>
        </div>

        {/* Divider */}
        <div className="self-stretch h-px border-t bg-[#e4e7ec] my-0" />

        {/* "My Workflows" Button */}
        <div className="px-4 p-2">
          <TabButton
            icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-icon.svg`}
            label="My Flows"
            isActive={activeTabId === 'flows'}
            onClick={() => handleTabClick('flows')}
          />
        </div>

        <div className="self-stretch h-px border-t bg-[#e4e7ec] my-0" />

        {/* Folder section with proper scrolling */}
        <div 
          ref={folderContainerRef}
          className="flex-grow overflow-y-auto"
        >
          {/* My folders header */}
          <div className="w-full px-6 py-4 flex justify-between items-center">
            <div className="text-[#667085] text-sm font-semibold font-['Inter'] leading-tight">
              My folders
            </div>
            <button
              onClick={() => onCreateFolder()}
              className="w-5 h-5 relative overflow-hidden"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-dark.svg`}
                alt="Add Folder"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </button>
          </div>

          {/* Folders container with fixed width and no shrinking */}
          <div className="px-4">
            <div className="flex flex-col w-full">
              {activeWorkspace?.folders
                ?.filter((folder) => folder.parent_id === null)
                .map((folder) => renderFolderWithSubfolders(folder))}
            </div>
          </div>
        </div>

        {/* Integrated Footer */}
        <div className="w-full p-4 border-t border-[#e4e7ec] flex-col justify-start items-center gap-3 inline-flex bg-white">
          <div className="w-full self-stretch flex-col justify-start items-start gap-1 flex">
            <div
              onClick={onOpenHelpCenter}
              className="w-full self-stretch px-3 py-2 bg-white rounded-md justify-start items-center gap-2 inline-flex overflow-hidden hover:bg-[#F9FAFB] transition duration-300 cursor-pointer"
            >
              <div className="w-full grow shrink basis-0 justify-start items-center gap-3 flex">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`}
                  alt="Support Icon"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                  Support
                </div>
              </div>
            </div>
            <div
              onClick={onOpenUserSettings}
              className="w-full self-stretch px-3 py-2 bg-white rounded-md justify-start items-center gap-2 inline-flex overflow-hidden hover:bg-[#F9FAFB] transition duration-300 cursor-pointer"
            >
              <div className="w-full grow shrink basis-0 justify-start items-center gap-3 flex">
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`}
                  alt="Settings Icon"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                  Settings
                </div>
              </div>
            </div>
          </div>
          <a
            href={`https://tally.so/r/wkRej6?email=${encodeURIComponent(userEmail)}`}
            className="w-full self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 inline-flex overflow-hidden hover:bg-[#F9FAFB] transition duration-300 cursor-pointer"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/send-01.svg`}
              alt="Send Icon"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <div className="px-0.5 justify-center items-center flex">
              <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                Send a feedback
              </div>
            </div>
          </a>
          <div className="w-full justify-center items-center gap-2 inline-flex">
            <div className="text-center text-[#667085] text-sm font-normal font-['Inter'] leading-tight">
              @ 2025 ProcessFlow, Inc.
            </div>
          </div>
        </div>
        {/* Resize Handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-200 transition-colors"
          onMouseDown={startResizing}
        />
      </div>
    </div>
  );
}

export const getUser = cache(async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
