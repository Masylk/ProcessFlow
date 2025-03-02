'use client';

import { Workflow } from '@/types/workflow';
import { createDeleteConfirmationModal } from '@/app/utils/modalPatterns';

interface ConfirmDeleteModalProps {
  onClose: () => void;
  onDelete: (workflowId: number) => Promise<void>;
  selectedWorkflow: Workflow;
}

export default function ConfirmDeleteFlowModal({
  onClose,
  onDelete,
  selectedWorkflow,
}: ConfirmDeleteModalProps) {
  // Use the pattern function to create the modal
  return createDeleteConfirmationModal({
    title: 'Confirm delete',
    message: 'Are you sure you want to delete this Flow? This action cannot be undone.',
    itemType: 'flow',
    onDelete: async () => {
      console.log('deleting: ' + selectedWorkflow.name);
      await onDelete(selectedWorkflow.id);
      onClose();
    },
    onClose: onClose
  });
}
