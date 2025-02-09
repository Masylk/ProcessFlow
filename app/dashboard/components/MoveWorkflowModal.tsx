'use client';

import { Workflow } from '@/types/workflow';
import { Workspace, Folder } from '@/types/workspace';
import React, { useState } from 'react';

interface MoveWorkflowModalProps {
  onClose: () => void;
  activeWorkspace: Workspace;
  selectedWorkflow: Workflow;
}

export default function MoveWorkflowModal({
  onClose,
  activeWorkspace,
  selectedWorkflow,
}: MoveWorkflowModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Filter folders based on the search term
  const filteredFolders = activeWorkspace.folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="fixed inset-0 flex items-center justify-center z-50 w-full">
      <div className="absolute inset-0 backdrop-blur-lg flex justify-center items-center">
        <div className="absolute inset-0 opacity-70 bg-[#0c111d]/70" />
      </div>
      <div className="relative z-10 w-[400px] h-[515px] bg-white rounded-xl shadow-md flex flex-col justify-center items-center overflow-hidden">
        <div className="w-[400px] h-[24px] relative" />
        <div className="self-stretch h-[136px] flex flex-col justify-center items-start px-6">
          <div className="w-12 h-12 p-3 bg-white rounded-[10px] shadow-md border border-[#e4e7ec] flex justify-center items-center overflow-hidden">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-download.svg`}
              alt="Folder move icon"
              className="w-6 h-6"
            />
          </div>
          <div className="self-stretch h-7 flex flex-col justify-start items-start gap-1 mb-4 mt-4">
            <div className="text-[#101828] text-lg font-semibold">
              Move Flow "{selectedWorkflow.name}"
            </div>
          </div>
        </div>
        {/* Search bar */}
        <div className="self-stretch h-11 px-6 flex flex-col justify-start items-start gap-5 mb-4">
          <div className="self-stretch h-11 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] flex items-center gap-2">
            <div className="w-4 h-4">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`}
                alt="Search icon"
                className="w-4 h-4"
              />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search"
              className="flex-grow text-[#667085] text-base font-normal bg-transparent focus:outline-none"
            />
          </div>
        </div>
        {/* Divider */}
        <div className="self-stretch h-px bg-[#e4e7ec] mb-4"></div>
        {/* Render folders */}
        <div className="self-stretch h-[194px] px-3 flex flex-col gap-1 overflow-y-auto">
          {filteredFolders.map((folder) => {
            // Calculate file count for each folder
            const fileCount = activeWorkspace.workflows.filter(
              (workflow) => workflow.folder_id === folder.id
            ).length;

            return (
              <Department
                key={folder.id}
                name={folder.name}
                fileCount={fileCount}
              />
            );
          })}
        </div>
        {/* Buttons */}
        <div className="self-stretch h-[100px] pt-8 flex flex-col justify-start items-center">
          <div className="self-stretch px-6 pb-6 flex gap-3">
            <button
              onClick={() => onClose()}
              className="grow h-11 px-4 py-2.5 bg-white rounded-lg shadow-md border border-[#d0d5dd] flex justify-center items-center transition duration-300 hover:bg-[#F9FAFB]"
            >
              <span className="text-[#344054] text-base font-semibold">
                Cancel
              </span>
            </button>
            <button className="grow h-11 px-4 py-2.5 bg-[#4e6bd7] rounded-lg shadow-md flex justify-center items-center transition duration-300 hover:bg-[#374C99]">
              <span className="text-white text-base font-semibold">Move</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Department({ name, fileCount }: { name: string; fileCount: number }) {
  return (
    <div className="self-stretch px-1.5 py-px bg-white inline-flex items-center hover:bg-[#F9FAFB] transition duration-300 rounded-[6px]">
      <div className="grow h-[60px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
        <div className="grow h-[42px] flex items-start gap-2">
          <div className="w-4 h-4 relative overflow-hidden" />
          <div className="grow flex flex-col justify-center items-start gap-1">
            <div className="text-[#344054] text-sm font-medium">{name}</div>
            <div className="text-[#667085] text-xs font-normal">
              Processflow - {fileCount} files
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
