'use client';

import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';
import { Path as PathType } from '@/types/path'; // Import the Path type
import Path from './Path'; // Ensure the path to the Path component is correct

interface CanvasProps {
  initialPath: PathType; // Accept a single path as a parameter
  workspaceId: string;
  workflowId: string;
}

export default function Canvas({
  initialPath, // Using a single Path object
  workspaceId,
  workflowId,
}: CanvasProps) {
  const [path, setPath] = useState<PathType | null>(initialPath);

  useEffect(() => {
    // Ensure path is updated if initialPath changes
    setPath(initialPath);
  }, [initialPath]);

  const handleUpdatePathOption = async (
    pathOptionId: number,
    relatedBlockId: number
  ) => {
    try {
      const response = await fetch(
        `/api/path-options/${pathOptionId}/related-blocks`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blockId: relatedBlockId }),
        }
      );

      if (!response.ok) {
        console.error('Failed to update PathOption with related block');
      }
    } catch (error) {
      console.error('Error updating PathOption:', error);
    }
  };

  // Render path safely
  return (
    <div className="flex">
      <div className="flex-1 p-6">
        {path ? (
          <Path
            key={path.id} // Assuming path has a unique id
            pathId={path.id}
            workspaceId={parseInt(workspaceId)}
            workflowId={path.workflowId}
          />
        ) : (
          <p>Loading...</p> // Placeholder for when path is undefined
        )}
      </div>
    </div>
  );
}
