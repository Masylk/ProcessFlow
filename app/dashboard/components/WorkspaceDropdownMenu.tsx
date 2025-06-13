'use client';

import { Workspace } from '@/types/workspace';
import React, { useState, useEffect, useRef } from 'react';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import { useColors } from '@/app/theme/hooks';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkspaceDropdownMenuProps {
  userEmail: string;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  onClose: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenCreateWorkspaceModal: () => void;
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
  onOpenCreateWorkspaceModal,
}: WorkspaceDropdownMenuProps) {
  const colors = useColors();
  const router = useRouter();
  const [isWorkspaceListVisible, setIsWorkspaceListVisible] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);

  const handleSettingsClick = () => {
    onOpenSettings();
    onClose();
  };

  const handleCreateWorkspace = (workspaceData: {
    name: string;
    logo?: File;
    url: string;
  }) => {
    // TODO: Implement workspace creation logic, likely calling an API
    // For now, just close the modal
    onClose();
  };

  const handleOpenCreateWorkspaceModal = () => {
    // Call the parent's handler to open the modal
    onOpenCreateWorkspaceModal();
    // Close the dropdown
    onClose();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{
          duration: 0.15,
          ease: [0.16, 1, 0.3, 1], // Custom easing for smooth feel
        }}
        style={{
          backgroundColor: colors['bg-secondary'],
          borderColor: colors['border-primary'],
        }}
        className="w-fit py-1 rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] border flex flex-col justify-start items-start overflow-visible"
      >
        {/* Settings Option */}
        <button
          onClick={handleSettingsClick}
          onMouseEnter={() => setIsWorkspaceListVisible(false)}
          className="w-[200px] px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
        >
          <div
            style={
              {
                '--hover-bg': colors['bg-quaternary'],
              } as React.CSSProperties
            }
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/settings-icon.svg`}
                className="w-4 h-4"
              />
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm font-normal font-['Inter'] leading-tight"
              >
                Settings
              </div>
            </div>
          </div>
        </button>

        {/* Separator */}
        <div
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-b my-1 hidden"
        />

        {/* Switch Workspace Option */}
        <div className="group relative w-full">
          <button
            className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
            onMouseEnter={() => setIsWorkspaceListVisible(true)}
            onClick={(e) => {
              e.stopPropagation();
              setIsWorkspaceListVisible(!isWorkspaceListVisible);
            }}
          >
            <div
              style={
                {
                  '--hover-bg': colors['bg-quaternary'],
                } as React.CSSProperties
              }
              className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden gap-9"
            >
              <div className="flex items-center gap-2">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/switch-horizontal-01.svg`}
                  className="w-4 h-4"
                />
                <div
                  style={{ color: colors['text-primary'] }}
                  className="text-sm font-normal font-['Inter'] leading-tight"
                >
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
          <AnimatePresence>
            {isWorkspaceListVisible && (
              <motion.div
                ref={submenuRef}
                initial={{ opacity: 0, scale: 0.95, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -10 }}
                transition={{
                  duration: 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  backgroundColor: colors['bg-secondary'],
                  borderColor: colors['border-primary'],
                }}
                className="absolute left-full top-[-7px] w-[264px] rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 border"
              >
                {/* Email Header */}
                <div className="px-1.5 py-px">
                  <div
                    style={{ color: colors['text-tertiary'] }}
                    className="px-2.5 py-[9px] text-sm font-normal cursor-default"
                  >
                    {userEmail}
                  </div>
                </div>

                <div
                  style={{ borderColor: colors['border-secondary'] }}
                  className="self-stretch h-px border-b my-1"
                />

                {/* Workspace List */}
                <div>
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={async () => {
                        try {
                          // Call the API to switch workspace
                          const res = await fetch(
                            '/api/user/switch-workspace',
                            {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                workspaceId: workspace.id,
                              }),
                            }
                          );
                          if (!res.ok) {
                            const error = await res.json();
                            throw new Error(
                              error.error || 'Failed to switch workspace'
                            );
                          }
                          // Close the dropdown menu
                          onClose();
                          // Small delay to ensure state updates are processed
                          setTimeout(() => {
                            router.refresh();
                          }, 100);
                        } catch (error) {
                          console.error('Error switching workspace:', error);
                          alert('Failed to switch workspace.');
                        }
                      }}
                      className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
                    >
                      <div
                        style={
                          {
                            '--hover-bg': colors['bg-quaternary'],
                          } as React.CSSProperties
                        }
                        className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex items-center gap-2">
                          {workspace.icon_url ? (
                            <img
                              src={workspace.icon_url}
                              alt={workspace.name}
                              className="w-6 h-6 rounded-lg object-cover"
                              onError={(e) => {
                                // If image fails to load, fallback to the default letter display
                                e.currentTarget.style.display = 'none';
                                const sibling = e.currentTarget
                                  .nextElementSibling as HTMLElement;
                                if (sibling) {
                                  sibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-normal"
                            style={{
                              backgroundColor:
                                workspace.background_colour || '#4299E1',
                              display: workspace.icon_url ? 'none' : 'flex',
                            }}
                          >
                            {workspace.name.charAt(0).toUpperCase()}
                          </div>
                          <div
                            style={{ color: colors['text-primary'] }}
                            className="text-sm font-normal"
                          >
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

                <div
                  style={{ borderColor: colors['border-secondary'] }}
                  className="self-stretch h-px hidden border-b my-1"
                />

                {/* Create/Join Options */}
                <button
                  onClick={handleOpenCreateWorkspaceModal}
                  className="w-full px-1.5 py-px justify-start items-center hidden cursor-pointer"
                >
                  <div
                    style={
                      {
                        '--hover-bg': colors['bg-quaternary'],
                      } as React.CSSProperties
                    }
                    className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/plus-icon-grey.svg`}
                        className="w-4 h-4"
                      />
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="text-sm font-normal"
                      >
                        Create a new workspace
                      </div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={onClose}
                  className="w-full px-1.5 py-px justify-start items-center hidden cursor-pointer"
                >
                  <div
                    style={
                      {
                        '--hover-bg': colors['bg-quaternary'],
                      } as React.CSSProperties
                    }
                    className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/user-circle (1).svg`}
                        className="w-4 h-4"
                      />
                      <div
                        style={{ color: colors['text-primary'] }}
                        className="text-sm font-normal"
                      >
                        Add an account
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Separator */}
        <div
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-b my-1"
        />

        {/* Log out Option */}
        <button
          onClick={onLogout}
          onMouseEnter={() => setIsWorkspaceListVisible(false)}
          className="w-full px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
        >
          <div
            style={
              {
                '--hover-bg': colors['bg-quaternary'],
              } as React.CSSProperties
            }
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-between items-center flex hover:bg-[var(--hover-bg)] transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/log-out-icon.svg`}
                className="w-4 h-4"
              />
              <div
                style={{ color: colors['text-primary'] }}
                className="text-sm font-normal font-['Inter'] leading-tight"
              >
                Log out
              </div>
            </div>
          </div>
        </button>
      </motion.div>
    </>
  );
}
