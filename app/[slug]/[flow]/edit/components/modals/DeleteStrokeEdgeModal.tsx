import { createDeleteConfirmationModal } from '@/app/utils/modalPatterns';

interface DeleteStrokeEdgeModalProps {
  onClose: () => void;
  onDelete: () => void;
  label?: string;
}

export default function DeleteStrokeEdgeModal({
  onClose,
  onDelete,
  label,
}: DeleteStrokeEdgeModalProps) {
  return createDeleteConfirmationModal({
    title: 'Delete Connection',
    message: `Are you sure you want to delete this connection${label ? ` labeled "${label}"` : ''}? This action cannot be undone.`,
    itemType: 'connection',
    onDelete,
    onClose,
  });
}
