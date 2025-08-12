import { createDeleteConfirmationModal } from '@/app/utils/modalPatterns';

interface DeleteBlocksModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteBlocksModal({
  onClose,
  onConfirm,
}: DeleteBlocksModalProps) {
  return createDeleteConfirmationModal({
    title: 'Delete Blocks',
    message:
      'Are you sure you want to delete all blocks after this position? This action cannot be undone.',
    itemType: 'blocks',
    onDelete: onConfirm,
    onClose: onClose,
  });
}
