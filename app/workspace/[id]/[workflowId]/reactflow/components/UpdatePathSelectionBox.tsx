import React, { useEffect, useState } from 'react';
import { useUpdateModeStore } from '../store/updateModeStore';
import { usePathsStore } from '../store/pathsStore';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';

interface UpdatePathSelectionBoxProps {
  workspaceId: string;
  workflowId: string;
}

export function UpdatePathSelectionBox({
  workspaceId,
  workflowId,
}: UpdatePathSelectionBoxProps) {
  const {
    selectedEndBlocks,
    mergePathId,
    reset,
    isUpdateMode,
    originalEndBlocks,
  } = useUpdateModeStore();
  const allPaths = usePathsStore((state) => state.paths);
  const [isUpdating, setIsUpdating] = useState(false);
  const colors = useColors();

  // Helper function to get end block ID for a path
  const getEndBlockId = (pathId: number) => {
    const path = allPaths.find((p) => p.id === pathId);
    return path?.blocks.find((b) => b.type === 'END' || b.type === 'LAST')?.id;
  };

  // Helper function to get path ID from end block ID
  const getPathIdFromEndBlock = (blockId: number) => {
    return allPaths.find((p) =>
      p.blocks.some(
        (b) => b.id === blockId && (b.type === 'END' || b.type === 'LAST')
      )
    )?.id;
  };

  // Monitor selectedEndBlocks changes
  useEffect(() => {
    // Blocks to connect: blocks in current selection that weren't in original list
    const parents_to_connect = selectedEndBlocks.filter(
      (blockId) => !originalEndBlocks.includes(blockId)
    );

    // Blocks to disconnect: blocks in original list that aren't in current selection
    const parents_to_disconnect = originalEndBlocks.filter(
      (blockId) => !selectedEndBlocks.includes(blockId)
    );

    console.log('Selected blocks changed:', {
      selectedEndBlocks,
      originalEndBlocks,
      parents_to_connect,
      parents_to_disconnect,
    });
  }, [selectedEndBlocks, originalEndBlocks, allPaths]);

  // Don't render if update mode is not enabled
  if (!isUpdateMode) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      if (!mergePathId) return;

      // Now we're working directly with end block IDs
      const parents_to_connect = selectedEndBlocks.filter(
        (blockId) => !originalEndBlocks.includes(blockId)
      );

      const parents_to_disconnect = originalEndBlocks.filter(
        (blockId) => !selectedEndBlocks.includes(blockId)
      );

      console.log('Updating merge path:', {
        mergePathId,
        parents_to_connect,
        parents_to_disconnect,
      });

      // Update the merge path connections
      await fetch(`/api/paths/merge/${mergePathId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parents_to_connect,
          parents_to_disconnect,
        }),
      });

      // Fetch updated paths with correct workspaceId and workflowId
      const pathsResponse = await fetch(
        `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
      );

      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        window.dispatchEvent(
          new CustomEvent('updatePaths', {
            detail: pathsData.paths,
          })
        );
      }

      reset();
    } catch (error) {
      console.error('Error updating merge:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[400px] flex items-center justify-between gap-2 px-2 py-2 rounded-lg shadow-lg border bg-gray-900 dark:bg-white border-gray-700 dark:border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300 dark:text-gray-600">
          {selectedEndBlocks.length} node
          {selectedEndBlocks.length > 1 ? 's' : ''} selected
        </span>
        <button
          onClick={reset}
          disabled={isUpdating}
          className={`p-1 rounded-full text-gray-300 dark:text-gray-600 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors ${
            isUpdating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 18L18 6M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <ButtonNormal
        onClick={handleUpdate}
        disabled={isUpdating}
        isLoading={isUpdating}
        loadingText="Updating..."
        variant="primary"
        size="small"
      >
        Update merge
      </ButtonNormal>
    </div>
  );
}
