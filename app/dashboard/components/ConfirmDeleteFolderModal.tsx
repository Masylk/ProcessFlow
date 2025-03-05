'use client';

import { createDeleteConfirmationModal } from '@/app/utils/modalPatterns';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onDelete: () => Promise<void>;
}

export default function ConfirmDeleteFolderModal({
  onClose,
  onDelete,
}: ConfirmDeleteModalProps) {
  // Use the pattern function to create the modal
  return createDeleteConfirmationModal({
    title: 'Confirm delete',
    message: 'Are you sure you want to delete this folder? This action cannot be undone. The flows inside will not be deleted.',
    itemType: 'folder',
    onDelete: async () => {
      await onDelete();
      onClose();
    },
    onClose: onClose
  });
}
