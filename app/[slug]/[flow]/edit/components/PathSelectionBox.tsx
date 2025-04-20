import { Path } from '../../types';
import React, { useState } from 'react';
import { usePathSelectionStore } from '../store/pathSelectionStore';
import { useColors } from '@/app/theme/hooks';
import ButtonNormal from '@/app/components/ButtonNormal';

export function PathSelectionBox({
  workspaceId,
  workflowId,
}: {
  workspaceId: string;
  workflowId: string;
}) {
  const { selectedPaths, selectedEndBlocks, reset, mergeMode, setMergeMode } =
    usePathSelectionStore();
  const colors = useColors();
  const [isMerging, setIsMerging] = useState(false);

  if (!mergeMode) return null;

  const handleMerge = async () => {
    if (selectedPaths.length < 2) return;

    setIsMerging(true);
    try {
      const payload = {
        name: 'Merge',
        workflow_id: parseInt(workflowId),
        parent_blocks: selectedEndBlocks,
      };
      console.log('payload', payload);
      await fetch('/api/paths/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Fetch updated paths after merge
      const pathsResponse = await fetch(
        `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
      );

      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        // Update paths in the Flow component
        window.dispatchEvent(
          new CustomEvent('updatePaths', {
            detail: pathsData.paths,
          })
        );
      }

      reset();
    } catch (error) {
      console.error('Error during merge:', error);
    } finally {
      setIsMerging(false);
      reset();
    }
  };

  const handleClose = () => {
    setMergeMode(false);
    reset();
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[400px] flex items-center justify-between gap-2 px-2 py-2 rounded-lg shadow-lg border bg-gray-900 dark:bg-white border-gray-700 dark:border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300 dark:text-gray-600">
          {selectedPaths.length} node{selectedPaths.length > 1 ? 's' : ''}{' '}
          selected
        </span>
        <button
          onClick={handleClose}
          disabled={isMerging}
          className={`p-1 rounded-full text-gray-300 dark:text-gray-600 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors ${
            isMerging ? 'opacity-50 cursor-not-allowed' : ''
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
        onClick={handleMerge}
        disabled={selectedPaths.length <= 1 || isMerging}
        isLoading={isMerging}
        loadingText="Merging..."
        variant="primary"
        leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-merge.svg`}
        size="small"
      >
        Merge Paths
      </ButtonNormal>
    </div>
  );
}
