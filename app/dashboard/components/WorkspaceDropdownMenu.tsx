'use client';

import React from 'react';

interface Workspace {
  id: number;
  name: string;
  teamTags?: string[];
}

interface WorkspaceDropdownMenuProps {
  userEmail: string;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => Promise<void>;
  onClose: () => void;
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
}: WorkspaceDropdownMenuProps) {
  return (
    <div className="w-[264px] bg-white rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] border border-[#e4e7ec] flex flex-col justify-start items-start">
      <div className="self-stretch py-1 flex flex-col justify-start items-start">
        {/* User Email Header */}
        <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex">
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex">
            <div className="flex justify-start items-center gap-2">
              <div className="w-[151px] text-[#667085] text-sm font-medium font-['Inter'] leading-tight">
                {userEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur horizontal entre le header email et la liste des workspaces */}
        <div className="self-stretch h-px border-t bg-[#e4e7ec] my-1" />

        {/* Workspaces List */}
        {workspaces.map((workspace, index) => (
          <div
            key={workspace.id}
            onClick={async () => {
              await setActiveWorkspace(workspace);
              onClose();
            }}
            className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer hover:bg-gray-100"
          >
            <div className="grow shrink basis-0 h-[42px] px-2.5 py-[9px] rounded-md justify-between items-center flex">
              <div className="flex items-center gap-2">
                {/* Remplacement du div w-6 h-6 par un avatar coloré */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{
                    backgroundColor: getColorFromString(workspace.name),
                  }}
                >
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  {workspace.name}
                </div>
              </div>
              {activeWorkspace && activeWorkspace.id === workspace.id ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/check-icon2.svg`}
                  alt="Active workspace"
                  className="w-4 h-4"
                />
              ) : (
                <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
                  {`⌘${index + 1}`}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Séparateur horizontal entre la liste des workspaces et le bouton "New workspace" */}
        {/* <div className="self-stretch h-px border-t bg-[#e4e7ec] my-1" /> */}

        {/* New Workspace Button */}
        {/* <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex disab">
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-between items-center flex">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative" />
              <button disabled className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                New workspace
              </button>
            </div>
            <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              ⌘W
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
