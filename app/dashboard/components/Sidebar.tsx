'use client';

import React, { useState } from 'react';
import WorkspaceDropdownMenu from './WorkspaceDropdownMenu';

interface Workspace {
  id: number;
  name: string;
  teamTags: string[];
}

interface SidebarProps {
  workspaces: Workspace[];
  userEmail: string;
}

export default function Sidebar({ workspaces, userEmail }: SidebarProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible((prev) => !prev);
  };

  return (
    <aside className="w-[240px] bg-white border-r border-gray-200 relative">
      {/* Sidebar Header */}
      <div className="h-[72px] px-4 py-3 flex-col justify-start items-start inline-flex">
        <div className="self-stretch px-3 py-2.5 bg-white rounded-md border border-[#e4e7ec] flex justify-between items-center overflow-hidden">
          <div className="flex items-center gap-2">
            <div className="flex items-start gap-2.5">
              <div className="flex justify-start items-start shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10)]">
                <div className="relative w-8 h-8 bg-gradient-to-bl from-[#4d6de3] to-[#1b2860] rounded-lg border border-white overflow-hidden shadow-[inset_0px_-2px_2px_0px_rgba(0,0,0,0.10)] shadow-[inset_0px_2px_2px_0px_rgba(255,255,255,0.10)] shadow-[inset_0px_0px_0px_0.6666666865348816px_rgba(16,24,40,0.24)]">
                  <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-b from-white to-white" />
                  <div className="absolute left-[6px] top-[4px] w-5 h-6 shadow-[0px_1.5px_3px_-1px_rgba(36,36,36,0.10)]">
                    <div className="absolute left-[3.33px] top-[1.33px] w-3.5 h-[21.28px]" />
                  </div>
                </div>
              </div>
            </div>
            {/* Wrap the "Processflow" text in a relative container */}
            <div
              className="relative flex flex-col px-0.5"
              onClick={toggleDropdown}
            >
              <div className="w-[84px] h-4 text-[#344054] text-sm font-semibold font-['Inter'] leading-tight cursor-pointer">
                Processflow
              </div>
            </div>
            {dropdownVisible && (
              <div className="absolute top-14 left-4 mt-2 z-10">
                <WorkspaceDropdownMenu
                  userEmail={userEmail}
                  workspaces={workspaces}
                />
              </div>
            )}
          </div>
          <div className="relative w-5 h-5 overflow-hidden" />
        </div>
      </div>
      {/* Optionally, you can display additional content here */}
    </aside>
  );
}
