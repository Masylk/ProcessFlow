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
}

export default function WorkspaceDropdownMenu({
  userEmail,
  workspaces,
}: WorkspaceDropdownMenuProps) {
  return (
    <div className="w-[264px] h-[270px] bg-white rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08)] border border-[#e4e7ec] flex-col justify-start items-start inline-flex overflow-hidden">
      <div className="self-stretch h-[270px] py-1 flex-col justify-start items-start flex overflow-hidden">
        {/* User Email Header */}
        <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex">
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden">
            <div className="flex justify-start items-center gap-2">
              <div className="w-[151px] text-[#667085] text-sm font-medium font-['Inter'] leading-tight">
                {userEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Workspaces List */}
        {workspaces.map((workspace, index) => (
          <div
            key={workspace.id}
            className="self-stretch px-1.5 py-px justify-start items-center inline-flex"
          >
            <div className="grow shrink basis-0 h-[42px] px-2.5 py-[9px] rounded-md justify-between items-center flex overflow-hidden">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 relative overflow-hidden" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 relative" />
                  <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                    {workspace.name}
                  </div>
                </div>
              </div>
              <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
                {`⌘${index + 1}`}
              </div>
            </div>
          </div>
        ))}

        {/* New Workspace Button */}
        <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex">
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-between items-center flex overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative overflow-hidden" />
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                New workspace
              </div>
            </div>
            <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              ⌘W
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
