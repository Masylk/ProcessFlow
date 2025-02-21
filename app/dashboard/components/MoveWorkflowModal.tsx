import React, { useState } from 'react';
import { Workspace, Folder } from '@/types/workspace';
import { Workflow } from '@/types/workflow';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';

interface MoveWorkflowModalProps {
  onClose: () => void;
  onConfirm: (folder: Folder | null) => Promise<Workflow | null>;
  activeWorkspace: Workspace;
  selectedWorkflow: Workflow;
}

export default function MoveWorkflowModal({
  onClose,
  onConfirm,
  activeWorkspace,
  selectedWorkflow,
}: MoveWorkflowModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [targetFolder, setTargetFolder] = useState<Folder | null | undefined>(
    undefined
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (value) {
      const matchingFolders = activeWorkspace.folders.reduce(
        (acc: Set<number>, folder) => {
          if (folder.name.toLowerCase().includes(value.toLowerCase())) {
            const parentFolders = getParentFolders(
              folder,
              activeWorkspace.folders
            );
            parentFolders.forEach((parent) => acc.add(parent.id));
            acc.add(folder.id);
          }
          return acc;
        },
        new Set<number>()
      );
      setExpandedFolders(matchingFolders);
    } else {
      setExpandedFolders(new Set());
    }
  };

  const getParentFolders = (folder: Folder, folders: Folder[]): Folder[] => {
    const parentFolder = folders.find((f) => f.id === folder.parent_id);
    return parentFolder
      ? [parentFolder, ...getParentFolders(parentFolder, folders)]
      : [];
  };

  const filteredFolders = searchTerm
    ? activeWorkspace.folders.reduce((acc: Folder[], folder) => {
        if (folder.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          const parentFolders = getParentFolders(
            folder,
            activeWorkspace.folders
          );
          return [...acc, ...parentFolders, folder];
        }
        return acc;
      }, [])
    : activeWorkspace.folders;

  const uniqueFilteredFolders = Array.from(
    new Map(filteredFolders.map((folder) => [folder.id, folder])).values()
  );

  const getChildFolders = (parentId: number | null) =>
    uniqueFilteredFolders.filter((folder) => folder.parent_id === parentId);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderClick = (folder: Folder | null) => {
    setTargetFolder(folder);
  };

  return (
    <main className="fixed bg-bran inset-0 flex items-center justify-center z-50 w-full">
      <div className="absolute inset-0 flex justify-center items-center">
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
        <div className="self-stretch h-11 px-6 flex flex-col justify-start items-start gap-5 mb-4">
          <InputField
            type="icon-leading"
            mode="light"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            iconUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`}
 
          />
        </div>
        <div className="self-stretch h-px bg-[#e4e7ec] mb-4"></div>
        <div className="self-stretch h-[194px] px-3 flex flex-col gap-1 overflow-y-auto">
          <div
            className={`self-stretch px-1.5 py-px inline-flex items-center transition duration-300 rounded-[6px] cursor-pointer ${
              targetFolder === null
                ? 'bg-[#E6E8EA]'
                : 'bg-white hover:bg-[#F9FAFB]'
            }`}
            onClick={() => handleFolderClick(null)}
          >
            <div className="grow h-[60px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-grey.svg`}
                alt="Root icon"
                className="w-4 h-4 relative"
                style={{ top: '-10px', left: '0px' }}
              />
              <div className="text-[#344054] text-sm font-medium">My Flows</div>
            </div>
          </div>
          <FolderList
            folders={uniqueFilteredFolders}
            parentId={null}
            getChildFolders={getChildFolders}
            activeWorkspace={activeWorkspace}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            handleFolderClick={handleFolderClick}
            targetFolder={targetFolder}
          />
        </div>
        <div className="self-stretch h-[100px] pt-8 flex flex-col justify-start items-center">
          <div className="self-stretch px-6 pb-6 flex gap-3">
            <ButtonNormal
              variant="secondaryGray"
              mode="light"
              size="small"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              mode="light"
              size="small"
              onClick={async () => {
                if (targetFolder !== undefined) {
                  await onConfirm(targetFolder);
                  onClose();
                }
              }}
              className="flex-1"
            >
              Move
            </ButtonNormal>
          </div>
        </div>
      </div>
    </main>
  );
}

function FolderList({
  folders,
  parentId,
  getChildFolders,
  activeWorkspace,
  expandedFolders,
  toggleFolder,
  handleFolderClick,
  targetFolder,
}: {
  folders: Folder[];
  parentId: number | null;
  getChildFolders: (parentId: number | null) => Folder[];
  activeWorkspace: Workspace;
  expandedFolders: Set<number>;
  toggleFolder: (folderId: number) => void;
  handleFolderClick: (folder: Folder | null) => void;
  targetFolder: Folder | null | undefined;
}) {
  return (
    <div>
      {getChildFolders(parentId).map((folder) => {
        const hasChildren = getChildFolders(folder.id).length > 0;
        const isSelected = targetFolder?.id === folder.id;

        return (
          <div key={folder.id} className="flex flex-col ml-4">
            <div
              className={`self-stretch px-1.5 py-px inline-flex items-center transition duration-300 rounded-[6px] cursor-pointer ${
                isSelected ? 'bg-[#E6E8EA]' : 'bg-white hover:bg-[#F9FAFB]'
              }`}
              onClick={() => {
                toggleFolder(folder.id);
                handleFolderClick(folder);
              }}
            >
              <div className="grow h-[60px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${
                    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH
                  }/assets/shared_components/${
                    folder.parent_id === null
                      ? 'folder-icon-grey.svg'
                      : 'corner-down-right-icon.svg'
                  }`}
                  alt="Folder icon"
                  className="w-4 h-4 relative"
                  style={{ top: '-10px', left: '0px' }}
                />
                <div className="grow h-[42px] flex items-start gap-2">
                  <div className="grow flex flex-col justify-center items-start gap-1">
                    <div className="text-[#344054] text-sm font-medium">
                      {folder.name}
                    </div>
                    <div className="text-[#667085] text-xs font-normal">
                      {activeWorkspace.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {Array.from(expandedFolders).includes(folder.id) && (
              <div className="ml-1">
                <FolderList
                  folders={folders}
                  parentId={folder.id}
                  getChildFolders={getChildFolders}
                  activeWorkspace={activeWorkspace}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  handleFolderClick={handleFolderClick}
                  targetFolder={targetFolder}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
