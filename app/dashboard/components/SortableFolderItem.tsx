'use client';

import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TabButton from '@/app/components/TabButton';
import { Folder } from '@/types/workspace';
import { useColors } from '@/app/theme/hooks';

interface SortableFolderItemProps {
  folder: Folder;
  isActive: boolean;
  onClick: () => void;
  onCreateSubfolder?: (folder: Folder) => void;
  onEditFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => Promise<void>;
  hasSubfolders?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelectFolder?: (folder?: Folder) => void;
  id: string;
  depth: number;
}

const SortableFolderItem = (props: SortableFolderItemProps) => {
  const {
    folder,
    isActive,
    onClick,
    onCreateSubfolder,
    onEditFolder,
    onDeleteFolder,
    hasSubfolders,
    isExpanded,
    onToggleExpand,
    onSelectFolder,
    id,
    depth,
  } = props;

  const colors = useColors();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative',
    zIndex: isDragging ? 999 : 'auto',
    boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none',
    backgroundColor: isDragging ? colors['bg-secondary'] : 'transparent',
    borderRadius: isDragging ? '6px' : '0',
    cursor: isDragging ? 'grabbing' : 'grab',
  } as React.CSSProperties;

  let folderIcon;
  if (folder.icon_url) {
    folderIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${folder.icon_url}`;
  } else {
    folderIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...attributes}
      className={`mt-1 max-w-full${isDragging ? ' dragging' : ''} relative group/folder`}
      data-depth={depth}
    >
      {/* Single Drag Handle Indicator - Only visible on hover */}
      <div 
        {...listeners}
        className="absolute left-[-16px] top-0 bottom-0 w-4 flex items-center justify-center opacity-0 group-hover/folder:opacity-40 hover:opacity-80 transition-opacity cursor-grab z-10"
        style={{ color: colors['text-tertiary'] }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="3" cy="3" r="1.5" fill="currentColor" />
          <circle cx="3" cy="9" r="1.5" fill="currentColor" />
          <circle cx="9" cy="3" r="1.5" fill="currentColor" />
          <circle cx="9" cy="9" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* TabButton without attaching listeners to it */}
      <div className="w-full">
        <TabButton
          icon={folder.emote ? '' : folderIcon}
          label={folder.name}
          emote={folder.emote}
          isActive={isActive}
          onClick={onClick}
          isFolder={true}
          folder={folder}
          onCreateSubfolder={onCreateSubfolder}
          onEditFolder={onEditFolder}
          onDeleteFolder={onDeleteFolder}
          hasSubfolders={hasSubfolders}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onSelectFolder={onSelectFolder}
          inSortableContext={true}
        />
      </div>
    </div>
  );
};

export default SortableFolderItem; 