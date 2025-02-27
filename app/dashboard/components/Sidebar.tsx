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
import { useTheme, useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import CreateWorkspaceModal from './CreateWorkspaceModal';

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
  onLogout: () => void;
  isSettingsView: boolean;
  setIsSettingsView: (isSettingsView: boolean) => void;
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
  onLogout,
  isSettingsView,
  setIsSettingsView,
}: SidebarProps) {
  const { currentTheme } = useTheme();
  const colors = useColors();
  const [activeTabId, setActiveTabId] = useState<string | null>('flows');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const folderContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);

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
    if (isSettingsView && (tabId === 'flows' || tabId?.startsWith('folder-'))) {
      setIsSettingsView(false);
    }
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

  const handleOpenCreateWorkspaceModal = () => {
    setShowCreateWorkspaceModal(true);
  };

  const handleCreateWorkspace = (workspaceData: {
    name: string;
    logo?: File;
    url: string;
  }) => {
    // TODO: Implement workspace creation logic
    setShowCreateWorkspaceModal(false);
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
      <div key={folder.id} className="mt-1 max-w-full">
        <TabButton
          icon={folder.emote ? '' : folderIcon}
          label={folder.name}
          emote={folder.emote}
          isActive={!isSettingsView && activeTabId === `folder-${folder.id}`}
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

  const getHeaderStyles = () => {
    const headerId = `workspace-header-${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: headerId,
      style: {
        backgroundColor: colors['bg-primary'],
      },
      hoverStyle: `
        #${headerId}:hover {
          background-color: ${colors['bg-secondary']} !important;
        }
      `
    };
  };

  const { id, style, hoverStyle } = getHeaderStyles();

  return (
    <>
      <style>{hoverStyle}</style>
      <div 
        ref={sidebarRef}
        style={{ 
          width: `${sidebarWidth}px`,
          backgroundColor: colors['bg-primary'],
          borderColor: colors['border-secondary']
        }}
        className="h-full border-r flex flex-col relative"
      >
        {/* Sidebar Header */}
        <div className="h-[72px] w-full px-4 py-3 flex-col justify-start items-start inline-flex">
          <div
            id={id}
            onClick={toggleDropdown}
            style={style}
            className="self-stretch px-3 py-2.5 cursor-pointer rounded-md flex justify-between items-center overflow-hidden transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-start gap-2.5">
                <div className="flex justify-start items-start ">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
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
                <div 
                  style={{ color: colors['text-primary'] }}
                  className="h-4 text-sm font-medium font-['Inter'] leading-tight"
                >
                  {activeWorkspace.name}
                </div>
              </div>
              {dropdownVisible && (
                <div 
                  className="fixed inset-0 z-10"
                  onClick={closeDropDown}
                >
                  <div 
                    className="absolute top-14 left-4 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <WorkspaceDropdownMenu
                      userEmail={userEmail}
                      workspaces={workspaces}
                      activeWorkspace={activeWorkspace}
                      setActiveWorkspace={setActiveWorkspace}
                      onClose={closeDropDown}
                      onOpenSettings={() => setIsSettingsView(true)}
                      onLogout={onLogout}
                      onOpenCreateWorkspaceModal={handleOpenCreateWorkspaceModal}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div 
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-t my-0" 
        />

        {/* "My Workflows" Button */}
        <div className="px-4 p-2">
          <TabButton
            icon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-icon.svg`}
            label="My Flows"
            isActive={!isSettingsView && activeTabId === 'flows'}
            onClick={() => handleTabClick('flows')}
          />
        </div>

        <div 
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-t my-0" 
        />

        {/* Folder section with proper scrolling */}
        <div 
          ref={folderContainerRef}
          className="flex-grow overflow-y-auto"
        >
          {/* My folders header */}
          <div className="w-full px-7 py-4 flex justify-between items-center">
            <div 
              style={{ color: colors['text-quaternary'] }}
              className="text-xs font-normal leading-tight"
            >
              MY FOLDERS
            </div>
            <button
              onClick={() => onCreateFolder()}
              className="w-5 h-5 relative overflow-hidden opacity-70 hover:opacity-100"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon.svg`}
                alt="Add Folder"
                width={20}
                height={20}
                className="w-5 h-5"
                style={{ filter: `brightness(0) saturate(100%) ${currentTheme === 'dark' ? 'invert(1)' : ''}` }}
              />
            </button>
          </div>

          {/* Folders container */}
          <div className="px-4">
            <div className="flex flex-col w-full">
              {activeWorkspace?.folders
                ?.filter((folder) => folder.parent_id === null)
                .map((folder) => renderFolderWithSubfolders(folder))}
            </div>
          </div>
        </div>

        {/* Integrated Footer */}
        <div 
          style={{ 
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary']
          }}
          className="w-full p-4 flex-col justify-start items-center gap-3 inline-flex border-t"
        >
          <ButtonNormal
            variant="secondary"
            size="small"
            className="w-full"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/send-01.svg`}
            onClick={() => window.open(`https://tally.so/r/wkRej6?email=${encodeURIComponent(userEmail)}`, '_blank')}
          >
            Send a feedback
          </ButtonNormal>
          <div 
            style={{ color: colors['text-tertiary'] }}
            className="w-full justify-center items-center gap-2 inline-flex"
          >
            <div className="text-center text-sm font-normal font-['Inter'] leading-tight">
              @ 2025 ProcessFlow, Inc.
            </div>
          </div>
        </div>

        {/* Add resize handle */}
        <div
          style={{ 
            backgroundColor: isResizing ? colors['bg-secondary'] : 'transparent'
          }}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors hover:bg-opacity-80"
          onMouseDown={startResizing}
        />
      </div>

      {/* CreateWorkspaceModal overlay */}
      {showCreateWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            className="absolute inset-0" 
            onClick={() => setShowCreateWorkspaceModal(false)} 
          />
          <div className="relative z-50">
            <CreateWorkspaceModal
              onClose={() => setShowCreateWorkspaceModal(false)}
              onCreateWorkspace={handleCreateWorkspace}
            />
          </div>
        </div>
      )}
    </>
  );
}

export const getUser = cache(async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
