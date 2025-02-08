import { Folder } from '@/types/workspace';

interface CanvaHeaderProps {
  openCreateFlow: () => void;
  selectedFolder?: Folder;
}

export default function CanvaHeader({
  openCreateFlow,
  selectedFolder,
}: CanvaHeaderProps) {
  const getFolderIcon = () => {
    if (selectedFolder?.icon_url) {
      // Display the icon_url if it exists
      return (
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${selectedFolder.icon_url}`}
          alt="Folder Icon"
          className="w-6 h-6"
        />
      );
    } else if (selectedFolder?.emote) {
      // Display the emote if icon_url does not exist
      return <div className="text-2xl">{selectedFolder.emote}</div>;
    } else {
      // Default folder icon if neither icon_url nor emote exist
      return (
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`}
          alt="Default Folder Icon"
          className="w-6 h-6"
        />
      );
    }
  };

  return (
    <div className="w-full h-[68px] py-5 px-8 justify-between items-center inline-flex border-b">
      <div className="justify-start items-center gap-4 flex">
        {/* Dynamically display folder icon */}
        {selectedFolder && getFolderIcon()}

        {/* Display selected folder name or nothing */}
        {selectedFolder && (
          <div className="text-[#101828] text-2xl font-semibold font-['Inter'] leading-loose">
            {selectedFolder.name}
          </div>
        )}
      </div>
      <div className="justify-end items-center gap-2 flex">
        {/* Import Process Button */}
        <div className="px-3  py-2 hidden bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-center items-center gap-1 flex overflow-hidden hover:bg-[#F9FAFB] transition-colors duration-300 cursor-pointer">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-01.svg`}
            alt="Import Icon"
            className="w-5 h-5"
          />
          <div className="px-0.5 justify-center items-center flex">
            <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
              Import a Process
            </div>
          </div>
        </div>
        {/* New Process Button */}
        <div
          onClick={() => openCreateFlow()}
          className="px-3 py-2 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] justify-center items-center gap-1 flex overflow-hidden hover:bg-[#374C99] transition-colors duration-300 cursor-pointer"
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-plus.svg`}
            alt="Plus Icon"
            className="w-5 h-5"
          />
          <div className="px-0.5 justify-center items-center flex">
            <div className="text-white text-sm font-semibold font-['Inter'] leading-tight">
              New Process
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
