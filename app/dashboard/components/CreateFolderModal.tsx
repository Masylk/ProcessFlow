'use client';

import React, { useState } from 'react';
import IconModifier from './IconModifier';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useColors } from '@/app/theme/hooks';
import Modal from '@/app/components/Modal';
import { checkFolderName } from '@/app/utils/checkNames';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface CreateFolderModalProps {
  onClose: () => void;
  onCreate: (
    folderName: string,
    icon_url?: string,
    emote?: string,
    signedIconUrl?: string
  ) => Promise<void>;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  onClose,
  onCreate,
}) => {
  const [folderName, setFolderName] = useState('');
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
  const [emote, setEmote] = useState<string | undefined>(undefined);
  const [previewIcon, setPreviewIcon] = useState<string | undefined>(undefined);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colors = useColors();

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    const nameError = checkFolderName(folderName);
    if (nameError) {
      toast.error(nameError.title, {
        description: nameError.description,
      });
      return;
    }

    setIsSubmitting(true);
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
        setIsSubmitting(false);
        return;
      }
    }
    try {
      if (uploadedIconUrl)
        await onCreate(
          folderName,
          uploadedIconUrl,
          undefined,
          uploadedSignedIcon
        );
      else if (emote) await onCreate(folderName, undefined, emote);
      else await onCreate(folderName);
      onClose();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Error Creating Folder', {
        description: 'An unexpected error occurred while creating the folder.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateIcon = (icon?: string, emote?: string) => {
    setIconUrl(icon);
    setEmote(emote);
  };

  // Define modal actions
  const modalActions = (
    <>
      <ButtonNormal
        variant="secondary"
        size="small"
        onClick={onClose}
        className="flex-1"
        disabled={isSubmitting}
      >
        Cancel
      </ButtonNormal>
      <ButtonNormal
        variant="primary"
        size="small"
        onClick={handleCreateFolder}
        disabled={!folderName.trim() || isSubmitting}
        className="flex-1"
      >
        {isSubmitting ? 'Creating...' : 'Create'}
      </ButtonNormal>
    </>
  );

  // Folder icon for this modal
  const folderIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`;

  return (
    <Modal
      onClose={onClose}
      title="Create a folder"
      icon={folderIcon}
      actions={modalActions}
      showActionsSeparator={true}
    >
      <div className="flex flex-col gap-4">
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
                setIconUrl(icon);
                setEmote(emote);
                setPreviewIcon(signedIcon ? signedIcon : icon || undefined);
                setPreviewFile(file || null);
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

export default CreateFolderModal;
