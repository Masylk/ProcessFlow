'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import WorkspaceDropdownMenu from './WorkspaceDropdownMenu';
import { Folder, Workspace } from '@/types/workspace';
import { User } from '@/types/user';
import TabButton from '@/app/components/TabButton';
import { cache } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { useTheme, useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import SortableFolderList from './SortableFolderList';
import { useFolderPositioning } from '../hooks/useFolderPositioning';
import { checkWorkspaceName } from '@/app/utils/checkNames';
import { AnimatePresence } from 'framer-motion';

interface SidebarProps {
  workspaces: Workspace[];
  userEmail: string;
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  onCreateFolder: (parentId?: number) => void;
  onEditFolder: (folder: Folder) => void;
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
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveTab?: (tab: string) => void;
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
  setWorkspaces,
  setActiveTab,
}: SidebarProps) {
  const { currentTheme } = useTheme();
  const colors = useColors();
  const [activeTabId, setActiveTabId] = useState<string | null>('flows');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const folderContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] =
    useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Use the folder positioning hook
  const { updateFolderPositions, isUpdating } = useFolderPositioning(
    activeWorkspace,
    setWorkspaces,
    workspaces
  );

  const startResizing = useCallback(
    (mouseDownEvent: React.MouseEvent) => {
      setIsResizing(true);
      const startWidth = sidebarWidth;
      const startX = mouseDownEvent.clientX;

      const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
        const newWidth = startWidth + mouseMoveEvent.clientX - startX;
        setSidebarWidth(Math.min(Math.max(240, newWidth), 480));
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [sidebarWidth]
  );

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
    // If this is a settings tab and setActiveTab is provided, call it
    if (tabId && !tabId.startsWith('folder-') && setActiveTab) {
      setActiveTab(tabId);
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

  const handleCreateWorkspace = async (workspaceData: {
    name: string;
    logo?: File;
    url: string;
  }) => {
    try {
      setIsLoading(true);
      // Format the URL slug to be URL-friendly
      const urlSlug = workspaceData.url
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      let response;

      const nameError = checkWorkspaceName(workspaceData.name);
      if (nameError) {
        toast.error(nameError.title + ' ' + nameError.description);
        return;
      }
      // If there's a logo, we need to use FormData
      if (workspaceData.logo) {
        const formData = new FormData();
        formData.append('logo', workspaceData.logo);
        formData.append(
          'data',
          JSON.stringify({
            name: workspaceData.name,
            slug: urlSlug,
          })
        );

        response = await fetch('/api/workspace/create', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Otherwise, use JSON
        response = await fetch('/api/workspace/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: workspaceData.name,
            slug: urlSlug,
          }),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('Error creating workspace:', error);
        toast.error(
          'Failed to create workspace: ' + (error.error || 'Unknown error')
        );
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      // Add the new workspace to local state
      if (workspaces && result.workspace) {
        setWorkspaces([...workspaces, result.workspace]);
      }

      // Close the modal
      setShowCreateWorkspaceModal(false);

      // Display success message
      toast.success('Workspace created successfully!');

      // Navigate to the new workspace
      if (result.workspace && result.workspace.id) {
        router.push(`/workspace/${result.workspace.id}`);
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('An error occurred while creating your workspace');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFolderWithSubfolders = (folder: Folder) => {
    const isExpanded = expandedFolders.has(folder.id);
    const subfolders = activeWorkspace.folders.filter(
      (f) => f.parent_id === folder.id
    );

    let folderIcon;
    if (folder.icon_url) {
      folderIcon = folder.icon_url.startsWith('https://cdn.brandfetch.io/')
        ? folder.icon_url
        : folder.signedIconUrl
          ? folder.signedIconUrl
          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
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
            {subfolders.map((subfolder) =>
              renderFolderWithSubfolders(subfolder)
            )}
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
      `,
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
          borderColor: colors['border-secondary'],
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
            data-testid="workspace-switcher"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="relative w-8 h-8">
                {activeWorkspace.icon_url && (
                  <img
                    src={activeWorkspace.icon_url}
                    alt={activeWorkspace.name}
                    className="w-8 h-8 rounded-lg object-cover absolute inset-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium absolute inset-0"
                  style={{
                    backgroundColor:
                      activeWorkspace.background_colour || '#4299E1',
                    display: 'flex',
                    opacity: activeWorkspace.icon_url ? 0 : 1,
                  }}
                >
                  {activeWorkspace.name.charAt(0).toUpperCase()}
                </div>
              </div>
              {/* Display activeWorkspace name */}
              <div className="relative flex flex-col px-0.5 min-w-0 flex-1">
                <div
                  style={{ color: colors['text-primary'] }}
                  className="text-sm font-medium font-['Inter'] leading-tight flex items-center justify-between gap-2 min-w-0"
                >
                  <span className="truncate min-w-0">
                    {activeWorkspace.name}
                  </span>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/chevron-selector-vertical.svg`}
                    alt="Open workspace menu"
                    width={20}
                    height={20}
                    className="w-5 h-5 flex-shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workspace Dropdown Overlay */}
        <AnimatePresence>
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
                  onOpenCreateWorkspaceModal={
                    handleOpenCreateWorkspaceModal
                  }
                />
              </div>
            </div>
          )}
        </AnimatePresence>

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
        <div ref={folderContainerRef} className="flex-grow overflow-y-auto">
          {/* My folders header */}
          <div className="flex flex-col">
            <div
              className="flex items-center justify-between px-7 py-4"
              data-testid="folders-section"
            >
              <span
                style={{ color: colors['text-tertiary'] }}
                className="text-xs font-normal"
              >
                MY FOLDERS
              </span>
              <button
                onClick={() => onCreateFolder()}
                className="w-5 h-5 relative overflow-hidden transition-all duration-200 hover:scale-110 hover:rotate-90"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon.svg`}
                  alt="Add Folder"
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
              </button>
            </div>

            {/* Folders container - REPLACED WITH SORTABLE FOLDER LIST */}
            <div className="px-4">
              <SortableFolderList
                activeWorkspace={activeWorkspace}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
                activeTabId={activeTabId}
                onTabClick={handleTabClick}
                onCreateSubfolder={onCreateSubfolder}
                onEditFolder={onEditFolder}
                onDeleteFolder={onDeleteFolder}
                onSelectFolder={onSelectFolder}
                isSettingsView={isSettingsView}
                updateFolderPositions={updateFolderPositions}
              />
            </div>
          </div>
        </div>

        {/* Integrated Footer */}
        <div
          style={{
            backgroundColor: colors['bg-primary'],
            borderColor: colors['border-secondary'],
          }}
          className="w-full p-4 flex-col justify-start items-center gap-3 inline-flex border-t"
        >
          {/* Free Plan Notification Card - Show when on free plan or no subscription */}
          {(!activeWorkspace.subscription ||
            activeWorkspace.subscription?.plan_type === 'FREE') &&
            activeWorkspace.workflows.length >= 4 && (
              <div
                style={{ backgroundColor: colors['bg-secondary'] }}
                className="w-full p-4 flex flex-col gap-4 rounded-lg relative"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex">
                    <span
                      style={{ color: colors['text-primary'] }}
                      className="text-sm font-semibold font-['Inter']"
                    >
                      Free plan
                    </span>
                  </div>
                  <span
                    style={{ color: colors['text-secondary'] }}
                    className="text-sm font-normal font-['Inter']"
                  >
                    {activeWorkspace.workflows.length === 5
                      ? "You've reached the limit of 5 workflows in the free plan. Upgrade to create more!"
                      : `Your team has used ${activeWorkspace.workflows.length}/5 workflows in the free plan. Need more?`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-grow h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4761C4] rounded-full"
                      style={{
                        width: `${Math.min((activeWorkspace.workflows.length / 5) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <span
                    style={{ color: colors['text-primary'] }}
                    className="text-sm font-medium"
                  >
                    {Math.min(
                      Math.round((activeWorkspace.workflows.length / 5) * 100),
                      100
                    )}
                    %
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex">
                  <ButtonNormal
                    variant="link-color"
                    size="small"
                    onClick={() => {
                      setIsSettingsView(true);
                      if (setActiveTab) {
                        setActiveTab('Plan');
                      }
                    }}
                  >
                    {activeWorkspace.workflows.length === 5
                      ? 'Upgrade to create more'
                      : 'Upgrade plan'}
                  </ButtonNormal>
                </div>
              </div>
            )}

          <ButtonNormal
            variant="secondary"
            size="small"
            className="w-full"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/send-01.svg`}
            onClick={() =>
              window.open(
                `https://tally.so/r/wkRej6?email=${encodeURIComponent(userEmail)}`,
                '_blank'
              )
            }
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
        <style>{`
          .resize-handle:hover {
            background-color: ${colors['border-secondary']} !important;
            opacity: 0.5 !important;
          }
        `}</style>
        <div
          style={{
            backgroundColor: isResizing
              ? colors['bg-secondary']
              : 'transparent',
          }}
          className="absolute right-0 top-0 bottom-0 w-[3px] cursor-col-resize resize-handle transition-all"
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
