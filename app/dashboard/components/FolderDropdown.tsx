import { Folder } from '@/types/workspace';
import { useColors } from '@/app/theme/hooks';
import { motion } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ 
        duration: 0.15, 
        ease: [0.16, 1, 0.3, 1] // Custom easing for smooth feel
      }}
      style={{
        backgroundColor: colors['bg-secondary'],
        borderColor: colors['border-primary']
      }}
      className="rounded-lg shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] py-1 border flex-col justify-start items-start inline-flex overflow-hidden"
    >
        {/* Edit folder Item */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
          onClick={() => onEditFolder(parent)}
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-200 overflow-hidden">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
                  alt="Edit Icon"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight">
                Edit folder
              </div>
            </div>
          </div>
        </div>

        {/* Create subfolder Item */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
          onClick={() => onCreateSubfolder(parent)}
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-200 overflow-hidden">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-01.svg`}
                  alt="Git Branch Icon"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight">
                Create subfolder
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line spacer */}
        <div 
          style={{ borderColor: colors['border-secondary'] }}
          className="self-stretch h-px border-b my-1" />

        {/* Delete folder Item */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex cursor-pointer"
          onClick={() => onDeleteFolder(parent)}
        >
          <div 
            style={{
              '--hover-bg': colors['bg-quaternary']
            } as React.CSSProperties}
            className="grow shrink basis-0 px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex hover:bg-[var(--hover-bg)] transition-all duration-200 overflow-hidden">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
                  alt="Trash Icon"
                  className="w-4 h-4 object-contain"
                />
              </div>
              <div 
                style={{ color: colors['text-primary'] }}
                className="grow shrink basis-0 text-sm font-normal font-['Inter'] leading-tight">
                Delete folder
              </div>
            </div>
          </div>
        </div>
    </motion.div>
  );
}
