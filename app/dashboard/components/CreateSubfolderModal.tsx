import React, { useState } from 'react';
import IconModifier from './IconModifier';
import { Folder } from '@/types/workspace';
import InputField from '@/app/components/InputFields';
import ButtonNormal from '@/app/components/ButtonNormal';
import { useColors } from '@/app/theme/hooks';
import Modal from '@/app/components/Modal';
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

const CreateSubfolderModal: React.FC<CreateSubfolderModalProps> = ({
  onClose,
  onCreate,
  parentId,
  parent,
}) => {
  const [folderName, setFolderName] = useState('');
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
  const [previewIcon, setPreviewIcon] = useState<string | undefined>(undefined);
  const [emote, setEmote] = useState<string | undefined>(undefined);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const colors = useColors();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateSubfolder = async () => {
    if (!folderName.trim()) return;
    setIsSaving(true);
    let uploadedIconUrl = iconUrl;
    let uploadedSignedIcon = previewIcon;
    if (previewFile) {
      try {
        const formData = new FormData();
        formData.append('file', previewFile);
        const response = await fetch('/api/upload-icon', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(data.error || 'Upload failed');
        uploadedIconUrl = data.data.iconUrl;
        uploadedSignedIcon = data.data.publicUrl || uploadedIconUrl;
      } catch (error) {
        console.error('Error uploading icon:', error);
        setIsSaving(false);
        return;
      }
    }
    try {
      if (uploadedIconUrl)
        await onCreate(
          folderName,
          parentId,
          uploadedIconUrl,
          undefined,
          uploadedSignedIcon
        );
      else if (emote) await onCreate(folderName, parentId, undefined, emote);
      else await onCreate(folderName, parentId);
      onClose();
    } catch (error) {
      // Optionally handle error (toast, etc.)
      console.error('Error creating subfolder:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateIcon = (icon?: string, emote?: string, signedIcon?: string) => {
    if (icon) {
      setIconUrl(icon);
      setEmote(undefined);
      setPreviewIcon(signedIcon ? signedIcon : icon || undefined);
    } else if (emote) {
      setIconUrl(undefined);
      setEmote(emote);
      setPreviewIcon(undefined);
    } else {
      setIconUrl(undefined);
      setEmote(undefined);
      setPreviewIcon(undefined);
    }
  };

  // Modal actions
  const modalActions = (
    <>
      <ButtonNormal
        variant="secondary"
        size="small"
        onClick={onClose}
        className="flex-1"
        disabled={isSaving}
      >
        Cancel
      </ButtonNormal>
      <ButtonNormal
        variant="primary"
        size="small"
        onClick={handleCreateSubfolder}
        disabled={!folderName.trim() || isSaving}
        className="flex-1"
      >
        {isSaving ? 'Creating...' : 'Create'}
      </ButtonNormal>
    </>
  );

  // Folder icon for this modal
  const folderIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`;

  return (
    <Modal
      onClose={onClose}
      title="Create a Subfolder"
      icon={folderIcon}
      actions={modalActions}
      showActionsSeparator={true}
    >
      <div className="flex flex-col gap-4">
        {/* Parent Info */}
        <div className="flex flex-row items-center gap-3">
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
              className="w-6 h-6 rounded mr-1"
            />
          ) : (
            <span className="text-lg mr-1">{parent.emote || ''}</span>
          )}
          <span
            className="text-sm font-medium"
            style={{ color: colors['text-secondary'] }}
          >
            Add a subfolder to <span className="ml-0.5">{parent.name}</span>
          </span>
        </div>
        {/* Input Field */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: colors['text-primary'] }}
          >
            Folder name <span style={{ color: colors['text-accent'] }}>*</span>
          </label>
          <div className="flex items-center gap-2">
            <IconModifier
              initialIcon={previewIcon}
              onUpdate={(icon, emote, signedIcon, file) => {
                if (icon) {
                  setIconUrl(icon);
                  setEmote(undefined);
                  setPreviewIcon(signedIcon ? signedIcon : icon || undefined);
                  setPreviewFile(file || null);
                } else if (emote) {
                  setIconUrl(undefined);
                  setEmote(emote);
                  setPreviewIcon(undefined);
                  setPreviewFile(null);
                } else {
                  setIconUrl(undefined);
                  setEmote(undefined);
                  setPreviewIcon(undefined);
                  setPreviewFile(null);
                }
              }}
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
      </div>
    </Modal>
  );
};

export default CreateSubfolderModal;
