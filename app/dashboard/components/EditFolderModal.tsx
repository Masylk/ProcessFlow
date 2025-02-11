import React, { useState } from 'react';
import IconModifier from './IconModifier';
import { Folder } from '@/types/workspace';

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
  const [folderName, setFolderName] = useState('');
  const [iconUrl, setIconUrl] = useState<string | undefined>(
    folder.icon_url || undefined
  );
  const [emote, setEmote] = useState<string | undefined>(folder.emote);

  const createFolder = (name: string) => {
    if (iconUrl) onEdit(name, iconUrl);
    else if (emote) onEdit(name, undefined, emote);
    else onEdit(name);
    onClose();
  };

  const updateIcon = (icon?: string, emote?: string) => {
    setIconUrl(icon);
    setEmote(emote);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-8 bg-[#0c111d] bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-[400px] p-6 flex flex-col">
        {/* Header */}
        <div className="flex flex-col items-start gap-4">
          <div className="w-12 h-12 p-3 bg-white rounded-[10px] border border-[#e4e7ec] shadow-sm flex items-center justify-center">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`}
              alt="Folder icon"
              className="w-12 h-12"
            />
          </div>
          <h2 className="text-[#101828] text-lg font-semibold">
            Edit a folder
          </h2>
        </div>

        {/* Input Field */}
        <div className="mt-4">
          <label className="block text-[#344054] text-sm font-semibold">
            Folder name <span className="text-[#4761c4]">*</span>
          </label>
          <div className="mt-2 flex items-center gap-2">
            <IconModifier
              initialIcon={iconUrl}
              onUpdate={updateIcon}
              emote={emote}
            />
            <input
              type="text"
              className="flex-1 h-11 px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-base text-[#101828]"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-11 w-full px-4 py-2.5 bg-white border border-[#d0d5dd] rounded-lg text-[#344054] font-semibold"
            onClick={onClose}
          >
            Discard changes
          </button>
          <button
            className="h-11 w-full px-4 py-2.5 bg-[#4e6bd7] text-white rounded-lg font-semibold"
            onClick={() => createFolder(folderName)}
            disabled={!folderName.trim()}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFolderModal;
