import { Folder } from '@/types/workspace';
import ButtonNormal from '../../components/ButtonNormal';
import ViewSwitch from '../../components/ViewSwitch';

interface CanvaHeaderProps {
  openCreateFlow: () => void;
  selectedFolder?: Folder;
  currentView: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

export default function CanvaHeader({
  openCreateFlow,
  selectedFolder,
  currentView,
  onViewChange,
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
    <div className="w-full h-[68px] py-5 px-8 justify-between items-center inline-flex border-b border-lightMode-border-secondary">
      <div className="justify-start items-center gap-4 flex">
        {/* Dynamically display folder icon */}
        {selectedFolder && getFolderIcon()}

        {/* Display selected folder name or nothing */}
        {selectedFolder && (
          <div className="text-lightMode-text-primary text-2xl font-medium font-['Inter'] leading-loose">
            {selectedFolder.name}
          </div>
        )}
      </div>
      <div className="justify-end items-center gap-2 flex">
        <ViewSwitch 
          currentView={currentView} 
          onViewChange={onViewChange} 
        />
        {/* Import Process Button */}
        <ButtonNormal
          variant="secondaryGray"
          mode="light"
          size="small"
          leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-01.svg`}
          className='hidden'
        >
          Import a process
        </ButtonNormal>
        {/* New Process Button */}
        <ButtonNormal
          variant="primary"
          mode="light"
          size="small"
          leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-plus.svg`}
          onClick={openCreateFlow}
          className='hidden'
        >
          New Flow
        </ButtonNormal>
      </div>
    </div>
  );
}
