import { Folder } from '@/types/workspace';

export interface TabButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  emote?: string;
  isFolder?: boolean;
  folder?: Folder;
  onCreateSubfolder?: (parentFolder: Folder) => void;
  onEditFolder?: (folder: Folder) => void;
  onDeleteFolder?: (folder: Folder) => Promise<void>;
  hasSubfolders?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function TabButton({ 
  icon, 
  label, 
  isActive, 
  onClick, 
  disabled,
  emote,
  isFolder,
  folder,
  onCreateSubfolder,
  onEditFolder,
  onDeleteFolder,
  hasSubfolders,
  isExpanded,
  onToggleExpand
}: TabButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
        ${isActive ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {emote ? (
        <span>{emote}</span>
      ) : (
        <img src={icon} alt="" className="w-5 h-5" />
      )}
      <span>{label}</span>
      {isFolder && hasSubfolders && (
        <span 
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
          className={`ml-auto transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        >
          →
        </span>
      )}
    </button>
  );
} 