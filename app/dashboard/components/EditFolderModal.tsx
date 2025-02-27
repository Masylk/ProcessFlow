import React, { useState } from 'react';
import IconModifier from './IconModifier';
import { Folder } from '@/types/workspace';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useColors } from '@/app/theme/hooks';

interface EditFolderModalProps {
  onClose: () => void;
  onEdit: (
    folderName: string,
    icon_url?: string,
    emote?: string
  ) => Promise<void>;
  initialIcon?: string;
  folder: Folder;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({
  onClose,
  onEdit,
  folder,
}) => {
  const colors = useColors();
  const [folderName, setFolderName] = useState(folder.name);
  const [iconUrl, setIconUrl] = useState<string | undefined>(
    folder.icon_url || undefined
  );
  const [emote, setEmote] = useState<string | undefined>(folder.emote);

  const createFolder = async (name: string) => {
    try {
      if (iconUrl) await onEdit(name, iconUrl);
      else if (emote) await onEdit(name, undefined, emote);
      else await onEdit(name);
      
      onClose();
    } catch (error) {
      console.error('Error editing folder:', error);
    }
  };

  const updateIcon = (icon?: string, emote?: string) => {
    if (icon) {
      setIconUrl(icon);
      setEmote(undefined);
    } else if (emote) {
      setIconUrl(undefined);
      setEmote(emote);
    } else {
      setIconUrl(undefined);
      setEmote(undefined);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-8"
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
        className="rounded-xl shadow-lg w-[400px] p-6 flex flex-col relative z-10"
        style={{ backgroundColor: colors['bg-primary'] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-start gap-4">
          <div 
            className="w-12 h-12 p-3 rounded-[10px] border shadow-sm flex items-center justify-center"
            style={{ 
              backgroundColor: colors['bg-secondary'],
              borderColor: colors['border-secondary']
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
              alt="Folder icon"
              className="w-12 h-12"
            />
          </div>
          <h2 
            className="text-lg font-semibold"
            style={{ color: colors['text-primary'] }}
          >
            Edit a folder
          </h2>
        </div>

        {/* Input Field */}
        <div className="mt-4">
          <label 
            className="block text-sm font-semibold"
            style={{ color: colors['text-primary'] }}
          >
            Folder name <span style={{ color: colors['text-accent'] }}>*</span>
          </label>
          <div className="mt-2 flex items-center gap-2">
            <IconModifier
              initialIcon={iconUrl}
              onUpdate={updateIcon}
              emote={emote}
            />
            <InputField
              type="default"
              value={folderName}
              onChange={setFolderName}
              placeholder="Enter folder name"
            />
          </div>
        </div>

        {/* Buttons */}
        <div 
          className="mt-6 flex gap-3"
        >
          <ButtonNormal
            variant="secondary"
            size="small"
            onClick={onClose}
            className="flex-1"
          >
            Discard changes
          </ButtonNormal>
          <ButtonNormal
            variant="primary"
            size="small"
            onClick={() => createFolder(folderName)}
            disabled={!folderName.trim()}
            className="flex-1"
          >
            Save changes
          </ButtonNormal>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;
