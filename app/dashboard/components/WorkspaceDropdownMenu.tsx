'use client';

import { Workspace } from '@/types/workspace';
import React, { useState, useEffect, useRef } from 'react';

interface WorkspaceDropdownMenuProps {
  userEmail: string;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  onClose: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

// Fonction utilitaire pour générer une couleur à partir d'une chaîne
function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
}

export default function WorkspaceDropdownMenu({
  userEmail,
  workspaces,
  activeWorkspace,
  setActiveWorkspace,
  onClose,
  onOpenSettings,
  onLogout,
}: WorkspaceDropdownMenuProps) {
  const [isWorkspaceListVisible, setIsWorkspaceListVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // If clicking outside both the main dropdown and submenu
      const clickedOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      const clickedOutsideSubmenu = submenuRef.current && !submenuRef.current.contains(event.target as Node);
      
      // If there's no submenu visible, only check the main dropdown
      // If submenu is visible, check both
      if (isWorkspaceListVisible) {
        if (clickedOutsideDropdown && clickedOutsideSubmenu) {
          onClose();
          setIsWorkspaceListVisible(false);
        }
      } else if (clickedOutsideDropdown) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, isWorkspaceListVisible]);

  const handleSettingsClick = () => {
    onOpenSettings();
    onClose();
  };

  return (
    <div 
      ref={dropdownRef}
      className="w-fit py-1 bg-white rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] border border-[#e4e7ec] flex flex-col justify-start items-start overflow-visible"
    >
      {/* Settings Option */}
      <button
        onClick={handleSettingsClick}
        onMouseEnter={() => setIsWorkspaceListVisible(false)}
        className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
      >
        <div className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-lightMode-bg-primary_hover transition-all duration-300 overflow-hidden">
          <div className="flex items-center gap-2">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`}
              className="w-4 h-4"
            />
            <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
              Settings
            </div>
          </div>
        </div>
      </button>

      {/* Separator */}
      <div className="self-stretch h-px border-t bg-[#e4e7ec] my-1" />

      {/* Switch Workspace Option */}
      <div className="group relative w-full">
        <button 
          className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
          onMouseEnter={() => setIsWorkspaceListVisible(true)}
        >
          <div className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-lightMode-bg-primary_hover transition-all duration-300 overflow-hidden gap-9">
            <div className="flex items-center gap-2">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/switch-horizontal-01.svg`}
                className="w-4 h-4"
              />
              <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
                Switch workspace
              </div>
            </div>
            <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/right-filled-chevron.svg`}
                className="w-2 h-2"
              />
          </div>
        </button>

        {/* Workspace List Submenu */}
        {isWorkspaceListVisible && (
          <div 
            ref={submenuRef}
            className="absolute left-full top-[-7px] w-[264px] bg-white rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 border border-[#e4e7ec]"
          >
            {/* Email Header */}
            <div className="px-1.5 py-px">
              <div className="px-2.5 py-[9px] text-[#667085] text-sm font-normal cursor-default">
                {userEmail}
              </div>
            </div>

            <div className="self-stretch h-px border-t bg-[#e4e7ec] my-1" />
            {/* Workspace List */}
            <div>
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={async () => {
                    await setActiveWorkspace(workspace);
                    onClose();
                  }}
                  className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
                >
                  <div className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-lightMode-bg-primary_hover transition-all duration-300 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-normal"
                        style={{ backgroundColor: workspace.background_colour || '#4299E1' }}
                      >
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-[#344054] text-sm font-normal">
                        {workspace.name}
                      </div>
                    </div>
                    {activeWorkspace?.id === workspace.id && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon3.svg`}
                        alt="Active"
                        className="w-4 h-4"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="self-stretch h-px border-t bg-[#e4e7ec] my-1" />
            {/* Create/Join Options */}

              <button className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer">
                <div className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center flex hover:bg-lightMode-bg-primary_hover transition-all duration-300 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-grey.svg`}
                      className="w-4 h-4"
                    />
                    <div className="text-[#344054] text-sm font-normal">
                      Create or join a workspace
                    </div>
                  </div>
                </div>
              </button>
              <button className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer">
                <div className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center flex hover:bg-lightMode-bg-primary_hover transition-all duration-300 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/user-circle (1).svg`}
                      className="w-4 h-4"
                    />
                    <div className="text-[#344054] text-sm font-normal">
                      Add an account
                    </div>
                  </div>
                </div>
              </button>
        
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="self-stretch h-px border-t bg-[#e4e7ec] my-1" />

      {/* Log out Option */}
      <button
        onClick={onLogout}
        onMouseEnter={() => setIsWorkspaceListVisible(false)}
        className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
      >
        <div className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-lightMode-bg-primary_hover transition-all duration-300 overflow-hidden">
          <div className="flex items-center gap-2">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/log-out-icon.svg`}
              className="w-4 h-4"
            />
            <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
              Log out
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
