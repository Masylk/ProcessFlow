import React, { useState } from 'react';
import IconModifier from './IconModifier';
import { Folder } from '@/types/workspace';
import InputField from '@/app/components/InputFields';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useColors } from '@/app/theme/hooks';
import DOMPurify from 'dompurify';

interface CreateSubfolderModalProps {
  onClose: () => void;
  onCreate: (
    folderName: string,
    parentId: number,
    icon_url?: string,
    emote?: string,
    signedIconUrl?: string
  ) => Promise<void>;
  parentId: number;
  parent: Folder;
}

const CreateFolderModal: React.FC<CreateSubfolderModalProps> = ({
  onClose,
  onCreate,
  parentId,
  parent,
}) => {
  const [folderName, setFolderName] = useState('');
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
  const [previewIcon, setPreviewIcon] = useState<string | undefined>(undefined);
  const [emote, setEmote] = useState<string | undefined>(undefined);
  const colors = useColors();
  const [isSaving, setIsSaving] = useState(false);

  const createFolder = (name: string) => {
    setIsSaving(true);
    if (iconUrl) onCreate(name, parentId, iconUrl, undefined, previewIcon);
    else if (emote) onCreate(name, parentId, undefined, emote);
    else onCreate(name, parentId);
    setIsSaving(false);
    onClose();
  };

  const updateIcon = (icon?: string, emote?: string, signedIcon?: string) => {
    if (icon) {
      setIconUrl(icon);
      setEmote(undefined);
      setPreviewIcon(signedIcon ? signedIcon : icon || undefined);
    } else if (emote) {
      setIconUrl(undefined);
      setEmote(emote);
    } else {
      setIconUrl(undefined);
      setEmote(undefined);
      setPreviewIcon(undefined);
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

      <div
        className="rounded-xl shadow-lg w-[400px] p-6 flex flex-col relative z-10"
        style={{ backgroundColor: colors['bg-primary'] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col items-start gap-1">
          <div
            className="w-12 h-12 p-3 rounded-[10px] border shadow-sm flex items-center justify-center"
            style={{
              backgroundColor: colors['bg-primary'],
              borderColor: colors['border-secondary'],
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
            Create a Subfolder
          </h2>
          <div
            className="text-sm font-normal font-['Inter'] leading-tight flex items-center gap-0"
            style={{ color: colors['text-secondary'] }}
          >
            Add a subfolder to
            {parent.icon_url ? (
              <img
                src={
                  parent.icon_url.startsWith('https://cdn.brandfetch.io/')
                    ? parent.icon_url
                    : parent.signedIconUrl
                      ? parent.signedIconUrl
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`
                }
                alt="icon"
                className="w-4 h-4 inline-block ml-1"
              />
            ) : (
              <span className="ml-1">{parent.emote || ''}</span>
            )}
            <span className="ml-0.5">{parent.name}</span>
          </div>
        </div>

        {/* Input Field */}
        <div className="mt-4">
          <label
            className="block text-sm font-semibold"
            style={{ color: colors['text-primary'] }}
          >
            Folder name<span style={{ color: colors['text-accent'] }}>*</span>
          </label>
          <div className="mt-2 flex items-center gap-2">
            <IconModifier
              initialIcon={previewIcon}
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
        <div className="mt-6 flex gap-3">
          <ButtonNormal
            variant="secondary"
            size="small"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </ButtonNormal>
          <ButtonNormal
            variant="primary"
            size="small"
            onClick={() => createFolder(folderName)}
            disabled={!folderName.trim() || isSaving}
            className="flex-1"
          >
            Create
          </ButtonNormal>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;
