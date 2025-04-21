import React, { useState } from 'react';
import { createDeleteConfirmationModal } from '@/app/utils/modalPatterns';

interface DeletePathModalProps {
  onClose: () => void;
  onConfirm: (success: boolean, errorMessage?: string) => void; // Updated
  pathName: string;
  pathId?: string;
  workflowId?: string;
  setAllPaths?: (paths: any[]) => void;
  onPathsUpdate?: (paths: any[]) => void;
}

export default function DeletePathModal({
  onClose,
  onConfirm,
  pathName,
  pathId,
  workflowId,
  setAllPaths,
  onPathsUpdate,
}: DeletePathModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeletePath = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/paths/${pathId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Error deleting path. Please try again.';
        try {
          const data = await response.json();
          if (data && data.error) {
            errorMessage = data.error;
          } else if (data && data.message) {
            errorMessage = data.message;
          }
        } catch {
          // fallback to default errorMessage if not JSON
        }
        throw new Error(errorMessage);
      }

      // Fetch updated paths
      const pathsResponse = await fetch(
        `/api/workspace/${workflowId}/paths?workflow_id=${workflowId}`
      );

      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        setAllPaths?.(pathsData.paths);
        onPathsUpdate?.(pathsData.paths);
      }

      setIsLoading(false);
      onConfirm(true); // Success
    } catch (error) {
      setIsLoading(false);
      let message = 'Error deleting path. Please try again.';
      if (typeof error === 'object' && error && 'message' in error) {
        message = (error as { message: string }).message;
      }
      onConfirm(false, message); // Failure, pass error message
      onClose();
    }
  };

  return createDeleteConfirmationModal({
    title: 'Delete Path',
    message: `Are you sure you want to delete ${pathName} and all blocks after this position? This action cannot be undone.`,
    itemType: 'path',
    onDelete: handleDeletePath,
    onClose,
    isLoading,
  });
}
