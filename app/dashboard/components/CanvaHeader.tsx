import { Folder } from '@/types/workspace';
import ButtonNormal from '../../components/ButtonNormal';
import { useColors } from '@/app/theme/hooks';

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
  const colors = useColors();

  const getFolderIcon = () => {
    if (selectedFolder?.icon_url) {
      // Display the icon_url if it exists
      return selectedFolder.icon_url.startsWith(
        'https://cdn.brandfetch.io/'
      ) ? (
        <img
          src={selectedFolder.icon_url}
          alt="Folder Icon"
          className="w-6 h-6"
        />
      ) : (
        <img
          src={`${selectedFolder.signedIconUrl}`}
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
    <div
      style={{
        borderColor: colors['border-secondary'],
      }}
      className="w-full h-[68px] py-5 px-8 justify-between items-center inline-flex border-b"
    >
      <div className="justify-start items-center gap-4 flex">
        {/* Dynamically display folder icon or default flows icon */}
        {selectedFolder ? (
          getFolderIcon()
        ) : (
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-icon.svg`}
            alt="Flows icon"
            className="w-6 h-6"
          />
        )}

        {/* Display selected folder name or "My Flows" */}
        <div
          style={{ color: colors['text-primary'] }}
          className="text-2xl font-medium font-['Inter'] leading-loose"
        >
          {selectedFolder ? selectedFolder.name : 'My Flows'}
        </div>
      </div>
      <div className="hidden justify-end items-center gap-2">
        {/* Import Process Button */}
        <ButtonNormal
          variant="secondary"
          size="small"
          leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/upload-01.svg`}
          className="hidden"
        >
          Import a process
        </ButtonNormal>
        {/* New Process Button */}
        <ButtonNormal
          variant="primary"
          size="small"
          leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/white-plus.svg`}
          onClick={openCreateFlow}
          className="hidden"
        >
          New Flow
        </ButtonNormal>
      </div>
    </div>
  );
}
