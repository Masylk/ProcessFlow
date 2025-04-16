import React, { useState } from 'react';
import { Workspace, Folder } from '@/types/workspace';
import { Workflow } from '@/types/workflow';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useColors } from '@/app/theme/hooks';
import { toast } from 'sonner';

interface MoveWorkflowModalProps {
  onClose: () => void;
  onConfirm: (
    folder: Folder | null
  ) => Promise<{
    workflow: Workflow | null;
    error?: { title: string; description: string };
  }>;
  activeWorkspace: Workspace;
  selectedWorkflow: Workflow;
}

export default function MoveWorkflowModal({
  onClose,
  onConfirm,
  activeWorkspace,
  selectedWorkflow,
}: MoveWorkflowModalProps) {
  const colors = useColors();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set()
  );
  const [targetFolder, setTargetFolder] = useState<Folder | null | undefined>(
    undefined
  );
  const [isMoving, setIsMoving] = useState(false);

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

  const handleMove = async () => {
    if (targetFolder === undefined) return;

    setIsMoving(true);
    try {
      const result = await onConfirm(targetFolder);

      if (result.error) {
        toast.error(result.error.title, {
          description: result.error.description,
        });
        return;
      }

      if (result.workflow) {
        onClose();
      }
    } catch (error) {
      console.error('Error moving flow:', error);
      toast.error('Error Moving Flow', {
        description: 'An unexpected error occurred while moving the flow.',
      });
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 w-full"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0">
        <div
          style={{ backgroundColor: colors['bg-overlay'] }}
          className="absolute inset-0 opacity-70"
        />
      </div>

      {/* Modal content */}
      <div
        className="relative z-10 w-[400px] h-[515px] rounded-xl shadow-md flex flex-col justify-center items-center overflow-hidden"
        style={{ backgroundColor: colors['bg-primary'] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[400px] h-[24px] relative" />
        <div className="self-stretch h-[136px] flex flex-col justify-center items-start px-6">
          <div
            className="w-12 h-12 p-3 rounded-[10px] shadow-sm flex justify-center items-center overflow-hidden"
            style={{
              backgroundColor: colors['bg-secondary'],
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: colors['border-secondary'],
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-download.svg`}
              alt="Folder move icon"
              className="w-6 h-6"
            />
          </div>
          <div className="self-stretch h-7 flex flex-col justify-start items-start gap-1 mb-4 mt-4">
            <div
              className="text-lg font-semibold"
              style={{ color: colors['text-primary'] }}
            >
              Move Flow "{selectedWorkflow.name}"
            </div>
          </div>
        </div>
        <div className="self-stretch h-11 px-6 flex flex-col justify-start items-start gap-5 mb-4">
          <InputField
            type="icon-leading"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search"
            iconUrl={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`}
          />
        </div>
        <div
          className="self-stretch h-px mb-4"
          style={{ backgroundColor: colors['border-secondary'] }}
        />
        <div className="self-stretch h-[194px] px-3 flex flex-col gap-1 overflow-y-auto">
          <div
            className="self-stretch px-1.5 py-px inline-flex items-center transition-colors duration-200 rounded-[6px] cursor-pointer"
            style={
              {
                backgroundColor:
                  targetFolder === null
                    ? colors['bg-quaternary']
                    : 'transparent',
                '--hover-bg': colors['bg-quaternary'],
              } as React.CSSProperties
            }
            onClick={() => handleFolderClick(null)}
          >
            <div className="grow h-[60px] px-2.5 py-[9px] rounded-md flex items-center gap-3 overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-grey.svg`}
                alt="Root icon"
                className="w-4 h-4 relative"
                style={{ top: '-10px', left: '0px' }}
              />
              <div
                className="text-sm font-medium"
                style={{ color: colors['text-primary'] }}
              >
                My Flows
              </div>
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
            colors={colors}
          />
        </div>
        <div className="self-stretch h-[100px] pt-8 flex flex-col justify-start items-center">
          <div className="self-stretch px-6 pb-6 flex gap-3">
            <ButtonNormal
              variant="secondary"
              size="small"
              onClick={onClose}
              className="flex-1"
              disabled={isMoving}
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal
              variant="primary"
              size="small"
              onClick={handleMove}
              className="flex-1"
              disabled={targetFolder === undefined || isMoving}
              isLoading={isMoving}
              loadingText="Moving..."
            >
              Move
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
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
  colors,
}: {
  folders: Folder[];
  parentId: number | null;
  getChildFolders: (parentId: number | null) => Folder[];
  activeWorkspace: Workspace;
  expandedFolders: Set<number>;
  toggleFolder: (folderId: number) => void;
  handleFolderClick: (folder: Folder | null) => void;
  targetFolder: Folder | null | undefined;
  colors: { [key: string]: string };
}) {
  return (
    <div>
      {getChildFolders(parentId).map((folder) => {
        const hasChildren = getChildFolders(folder.id).length > 0;
        const isSelected = targetFolder?.id === folder.id;

        return (
          <div key={folder.id} className="flex flex-col ml-4">
            <div
              className="self-stretch px-1.5 py-px inline-flex items-center transition-colors duration-200 rounded-[6px] cursor-pointer"
              style={
                {
                  backgroundColor: isSelected
                    ? colors['bg-quaternary']
                    : 'transparent',
                  '--hover-bg': colors['bg-quaternary'],
                } as React.CSSProperties
              }
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
                    <div
                      className="text-sm font-medium"
                      style={{ color: colors['text-primary'] }}
                    >
                      {folder.name}
                    </div>
                    <div
                      className="text-xs font-normal"
                      style={{ color: colors['text-secondary'] }}
                    >
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
                  colors={colors}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
