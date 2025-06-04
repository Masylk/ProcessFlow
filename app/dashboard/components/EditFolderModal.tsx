'use client';

import React, { useState } from 'react';
import IconModifier from './IconModifier';
import { Folder } from '@/types/workspace';
import ButtonNormal from '@/app/components/ButtonNormal';
import InputField from '@/app/components/InputFields';
import { useColors } from '@/app/theme/hooks';
import Modal from '@/app/components/Modal';
import { checkFolderName } from '@/app/utils/checkNames';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

interface EditFolderModalProps {
  onClose: () => void;
  onEdit: (
    folderName: string,
    icon_url?: string,
    emote?: string,
    signedIconUrl?: string
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
  const [previewIcon, setPreviewIcon] = useState<string | undefined>(
    folder.icon_url && folder.icon_url.startsWith('https://cdn.brandfetch.io/')
      ? folder.icon_url
      : folder.signedIconUrl || undefined
  );
  const [emote, setEmote] = useState<string | undefined>(folder.emote);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateIcon = (
    icon?: string,
    emote?: string,
    signedIcon?: string,
    file?: File
  ) => {
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
        Discard changes
      </ButtonNormal>
      <ButtonNormal
        variant="primary"
        size="small"
        onClick={async () => {
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
              await onEdit(
                folderName,
                uploadedIconUrl,
                undefined,
                uploadedSignedIcon
              );
            else if (emote) await onEdit(folderName, undefined, emote);
            else await onEdit(folderName);
            onClose();
          } catch (error) {
            console.error('Error editing folder:', error);
            toast.error('Error Saving Folder', {
              description:
                'An unexpected error occurred while saving the folder.',
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
        disabled={!folderName.trim() || isSubmitting}
        className="flex-1"
      >
        {isSubmitting ? 'Saving...' : 'Save changes'}
      </ButtonNormal>
    </>
  );

  // Folder icon for this modal
  const folderIcon = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon.svg`;

  return (
    <Modal
      onClose={onClose}
      title="Edit a folder"
      icon={folderIcon}
      iconBackgroundColor={colors['bg-secondary']}
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
              initialIcon={previewIcon || undefined}
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
      </div>
    </Modal>
  );
};

export default EditFolderModal;
