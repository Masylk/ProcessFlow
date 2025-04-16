import { createDeleteConfirmationModal } from '@/app/utils/modalPatterns';

interface DeletePathModalProps {
  onClose: () => void;
  onConfirm: () => void;
  pathName: string;
}

export default function DeletePathModal({
  onClose,
  onConfirm,
  pathName,
}: DeletePathModalProps) {
  return createDeleteConfirmationModal({
    title: 'Delete Path',
    message: `Are you sure you want to delete ${pathName} and all blocks after this position? This action cannot be undone.`,
    itemType: 'path',
    onDelete: onConfirm,
    onClose: onClose,
  });
}
