import React, { useState } from 'react';
import { createDeleteConfirmationModal } from '@/app/utils/modalPatterns';
import { usePathsStore } from '../../store/pathsStore';
import { Block } from '../../../types';

interface DeletePathModalProps {
  onClose: () => void;
  onConfirm: (success: boolean, errorMessage?: string) => void; // Updated
  pathName: string;
  pathId?: string;
  workflowId?: string;
  setAllPaths?: (paths: any[]) => void;
  onPathsUpdate?: (paths: any[]) => void;
}

// Utility function to remove the path from parent blocks' child_paths
function removePathFromParentBlocks(
  paths: any[],
  pathToDelete: any,
  pathId: string
) {
  if (!Array.isArray(pathToDelete.parent_blocks)) return paths;

  let updatedPaths = paths;
  pathToDelete.parent_blocks.forEach((parentBlock: any) => {
    updatedPaths = updatedPaths.map((path) => {
      if (!Array.isArray(path.blocks)) return path;
      return {
        ...path,
        blocks: path.blocks.map((block: Block) => {
          if (
            block.id === parentBlock.block_id &&
            Array.isArray(block.child_paths)
          ) {
            return {
              ...block,
              child_paths: block.child_paths.filter(
                (cp: any) => String(cp.path_id) !== String(pathId)
              ),
            };
          }
          return block;
        }),
      };
    });
  });
  return updatedPaths;
}

// Utility function to remove a path by id from the store and clean up parent blocks' child_paths
function removePathById(pathId: string, isSubPath = false) {
  usePathsStore.setState((state) => {
    // Find the path to be deleted
    const pathToDelete = state.paths.find(
      (p) => String(p.id) === String(pathId)
    );
    if (!pathToDelete) {
      return {
        paths: state.paths.filter((path) => String(path.id) !== String(pathId)),
      };
    }

    // --- Prevent deletion if parent block would be left with only one child path ---
    if (
      Array.isArray(pathToDelete.parent_blocks) &&
      pathToDelete.parent_blocks.length === 1 &&
      !isSubPath
    ) {
      const parentBlock = pathToDelete.parent_blocks[0];
      // Find the parent block in the paths store
      const parentPath = state.paths.find(
        (p) =>
          Array.isArray(p.blocks) &&
          p.blocks.some((b) => b.id === parentBlock.block_id)
      );
      const parentBlockObj = parentPath?.blocks?.find(
        (b: any) => b.id === parentBlock.block_id
      );
      if (
        parentBlockObj &&
        Array.isArray(parentBlockObj.child_paths) &&
        parentBlockObj.child_paths.length <= 2 // because we're about to remove one
      ) {
        // console.log('parentBlockObj', parentBlockObj);
        throw new Error(
          'Cannot delete this path: its parent block would be left with only one child path.'
        );
      }
    }

    // --- Cascade delete: recursively remove all child paths ---
    if (Array.isArray(pathToDelete.blocks)) {
      pathToDelete.blocks.forEach((block: any) => {
        if (Array.isArray(block.child_paths)) {
          block.child_paths.forEach((cp: any) => {
            // Recursively remove each child path
            removePathById(String(cp.path_id), true);
          });
        }
      });
    }

    // Remove the path from the list
    let updatedPaths = state.paths.filter(
      (path) => String(path.id) !== String(pathId)
    );

    // Remove the path from parent blocks' child_paths using the helper
    updatedPaths = removePathFromParentBlocks(
      updatedPaths,
      pathToDelete,
      pathId
    );

    return { paths: updatedPaths };
  });
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
      // Remove the path from the store immediately
      if (pathId) {
        try {
          removePathById(pathId);
        } catch (err: any) {
          setIsLoading(false);
          onConfirm(false, err?.message || 'Error deleting path.');
          return;
        }
      }
      setIsLoading(false);
      onConfirm(true); // Success
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

      // Optionally fetch updated paths from the server
      // if (workflowId) {
      //   const pathsResponse = await fetch(
      //     `/api/workspace/${workflowId}/paths?workflow_id=${workflowId}`
      //   );

      //   if (pathsResponse.ok) {
      //     const pathsData = await pathsResponse.json();
      //     setAllPaths?.(pathsData.paths);
      //     onPathsUpdate?.(pathsData.paths);
      //   }
      // }
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
