import { Folder } from '@/types/workspace';
import { useColors } from '@/app/theme/hooks';

interface FolderDropdownProps {
  onCreateSubfolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => Promise<void>;
  onEditFolder: (folder: Folder) => void;
  parent: Folder;
}

export default function FolderDropdown({
  onCreateSubfolder,
  onDeleteFolder,
  onEditFolder,
  parent,
}: FolderDropdownProps) {
  const colors = useColors();

  return (
    <div 
      style={{
        backgroundColor: colors['bg-secondary'],
        borderColor: colors['border-primary']
      }}
      className="shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 flex flex-col overflow-hidden cursor-pointer rounded-lg z-[9999] border"
    >
      <div
        onClick={() => onEditFolder(parent)}
        className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
      >
        <div 
          style={{
            '--hover-bg': colors['bg-quaternary']
          } as React.CSSProperties}
          className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-200 overflow-hidden"
        >
          <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
            <div className="w-4 h-4 relative overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                alt="Edit Icon"
                className="w-4 h-4"
              />
            </div>
            <div 
              style={{ color: colors['text-primary'] }}
              className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
            >
              Edit folder
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={() => onCreateSubfolder(parent)}
        className="self-stretch px-1.5 py-px flex items-center gap-3 transition duration-300"
      >
        <div 
          style={{
            '--hover-bg': colors['bg-quaternary']
          } as React.CSSProperties}
          className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-200 overflow-hidden"
        >
          <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
            <div className="w-4 h-4 relative overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-01.svg`}
                alt="Git Branch Icon"
                className="w-4 h-4"
              />
            </div>
            <div 
              style={{ color: colors['text-primary'] }}
              className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
            >
              Create subfolder
            </div>
          </div>
        </div>
      </div>

      <div 
        style={{ borderColor: colors['border-secondary'] }}
        className="self-stretch h-px border-b my-1" 
      />

      <div
        onClick={() => onDeleteFolder(parent)}
        className="self-stretch px-1.5 py-px flex items-center gap-3"
      >
        <div 
          style={{
            '--hover-bg': colors['bg-quaternary']
          } as React.CSSProperties}
          className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-200 overflow-hidden"
        >
          <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
            <div className="w-4 h-4 relative overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                alt="Trash Icon"
                className="w-4 h-4"
              />
            </div>
            <div 
              style={{ color: colors['text-primary'] }}
              className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight"
            >
              Delete folder
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
