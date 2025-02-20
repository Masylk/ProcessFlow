import { Folder } from '@/types/workspace';

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
  return (
    <div className="bg-white rounded-md shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03)] flex flex-col overflow-hidden cursor-pointer">
      <div
        onClick={() => onEditFolder(parent)}
        className="self-stretch px-4 py-3 flex items-center gap-3 transition duration-300 hover:bg-[#F9FAFB]"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-05.svg`}
          alt="Edit Icon"
          className="w-4 h-4"
        />
        <span className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
          Edit folder
        </span>
      </div>
      <div
        onClick={() => onCreateSubfolder(parent)}
        className="self-stretch px-4 py-3 flex items-center gap-3 border-b border-[#e4e7ec] transition duration-300 hover:bg-[#F9FAFB]"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-01.svg`}
          alt="Git Branch Icon"
          className="w-4 h-4"
        />
        <span className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
          Create subfolder
        </span>
      </div>

      <div
        onClick={() => onDeleteFolder(parent)}
        className="self-stretch px-4 py-3 flex items-center gap-3 transition duration-300 hover:bg-[#F9FAFB]"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-01.svg`}
          alt="Trash Icon"
          className="w-4 h-4"
        />
        <span className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
          Delete folder
        </span>
      </div>
    </div>
  );
}
