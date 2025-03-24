import { Path } from '../../types';
import React, { useState } from 'react';
import { usePathSelectionStore } from '../store/pathSelectionStore';

export function PathSelectionBox() {
  const {
    selectedPaths,
    selectedEndBlocks,
    workflowId,
    reset,
    mergeMode,
    setMergeMode,
  } = usePathSelectionStore();

  const [isMerging, setIsMerging] = useState(false);

  if (!mergeMode) return null;

  const handleMerge = async () => {
    if (selectedPaths.length < 2) return;

    setIsMerging(true);
    try {
      const payload = {
        name: 'Merge',
        workflow_id: workflowId,
        parent_blocks: selectedEndBlocks,
      };
      console.log('Sending merge payload:', payload);

      await fetch('/api/paths/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Fetch updated paths after merge
      const pathsResponse = await fetch(
        `/api/workspace/${workflowId}/paths?workflow_id=${workflowId}`
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {selectedPaths.length} node{selectedPaths.length > 1 ? 's' : ''}{' '}
          selected
        </span>
        <button
          onClick={handleClose}
          disabled={isMerging}
          className={`p-1 hover:bg-gray-100 rounded-full ${isMerging ? 'opacity-50 cursor-not-allowed' : ''}`}
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
      <button
        onClick={handleMerge}
        disabled={selectedPaths.length <= 1 || isMerging}
        className={`px-4 py-2 rounded-lg text-sm ${
          selectedPaths.length <= 1 || isMerging
            ? 'bg-blue-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
      >
        {isMerging ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Merging...
          </div>
        ) : (
          'Merge Nodes'
        )}
      </button>
    </div>
  );
}
