'use client';

import { Workflow } from '@/types/workflow';
import { createDeleteConfirmationModal } from '@/app/utils/modalPatterns';
import { useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);
  // Use the pattern function to create the modal
  return createDeleteConfirmationModal({
    title: 'Confirm delete',
    message:
      'Are you sure you want to delete this Flow? This action cannot be undone.',
    itemType: 'flow',
    onDelete: async () => {
      setIsLoading(true);
      await onDelete(selectedWorkflow.id);
      setIsLoading(false);
      onClose();
    },
    onClose: onClose,
    isLoading: isLoading,
  });
}
