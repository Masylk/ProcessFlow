'use client';

import React, { useState } from 'react';
import WorkspaceDropdownMenu from './WorkspaceDropdownMenu';
import FolderSection from './FolderSection';
import { Folder, Workspace } from '@/types/workspace';
import { User } from '@/types/user';

interface SidebarProps {
  workspaces: Workspace[];
  userEmail: string;
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  onCreateFolder: (parentId?: number) => void;
  onEditFolder: (parentFolder: Folder) => void;
  onCreateSubfolder: (parentFolder: Folder) => void;
  onDeleteFolder: () => void;
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
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  const closeDropDown = () => {
    setDropdownVisible(false);
  };

  return (
    <aside className="flex flex-col h-full w-[240px] bg-white border-r border-gray-200 relative">
      {/* Sidebar Header */}
      <div className="h-[72px] w-60 px-4 py-3 flex-col justify-start items-start inline-flex">
        <div
          onClick={toggleDropdown}
          className="self-stretch px-3 py-2.5 cursor-pointer bg-white rounded-md border border-[#e4e7ec] flex justify-between items-center overflow-hidden"
        >
          <div className="flex items-center gap-2">
            <div className="flex items-start gap-2.5">
              <div className="flex justify-start items-start shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)]">
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
        <button
          className="w-full h-9 px-3 py-2 bg-gray-50 rounded-md flex justify-start items-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => onSelectFolderView(undefined)}
        >
          <div className="w-5 h-5 relative overflow-hidden">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-icon.svg`}
              alt="My Workflows"
              className="w-5 h-5"
            />
          </div>
          <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
            My Flows
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="self-stretch h-px border-t bg-[#e4e7ec] my-0" />

      {/* FolderSection Component with flex-grow */}
      <div className="flex-grow overflow-auto">
        <FolderSection
          activeWorkspace={activeWorkspace}
          onCreateFolder={onCreateFolder}
          onEditFolder={onEditFolder}
          onCreateSubfolder={onCreateSubfolder}
          onDeleteFolder={onDeleteFolder}
          onSelectFolderView={onSelectFolderView}
          onSelectFolder={onSelectFolder}
          selectedFolder={selectedFolder}
        />
      </div>

      {/* Integrated Footer */}
      <div className="w-full p-4 border-t border-[#e4e7ec] flex-col justify-start items-center gap-3 inline-flex bg-white">
        <div className="w-full self-stretch flex-col justify-start items-start gap-1 flex">
          <div
            onClick={onOpenHelpCenter}
            className="w-full self-stretch px-3 py-2 bg-white rounded-md justify-start items-center gap-2 inline-flex overflow-hidden hover:bg-[#F9FAFB] transition duration-300 cursor-pointer"
          >
            <div className="w-full grow shrink basis-0 justify-start items-center gap-3 flex">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/support-icon.svg`}
                alt="Support Icon"
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
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`}
                alt="Settings Icon"
                className="w-5 h-5"
              />
              <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                Settings
              </div>
            </div>
          </div>
        </div>
        <a
          href="https://tally.so/forms/wkRej6/summary"
          className="w-full self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 inline-flex overflow-hidden hover:bg-[#F9FAFB] transition duration-300 cursor-pointer"
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/send-01.svg`}
            alt="Send Icon"
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
    </aside>
  );
}
