'use client';

import { useState } from 'react';
import { Folder, Workspace } from '@/types/workspace';
import { toast } from 'react-hot-toast';

export function useFolderPositioning(
  activeWorkspace: Workspace,
  setWorkspaces: (workspaces: Workspace[]) => void,
  workspaces: Workspace[]
) {
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Update folder positions in the database and refresh the workspace data
   */
  const updateFolderPositions = async (
    folderId: number,
    newParentId: number | null,
    newPosition: number,
    optimisticWorkspace?: Workspace 
  ) => {
    setIsUpdating(true);
    try {
      // If we have an optimistically updated workspace, use it immediately
      if (optimisticWorkspace) {
        setWorkspaces(workspaces.map(ws => 
          ws.id === optimisticWorkspace.id ? optimisticWorkspace : ws
        ));
      }

      const response = await fetch('/api/workspaces/folders/update-position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId,
          newParentId,
          newPosition,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update folder position');
      }

      // Only fetch from server if we didn't provide an optimistic update
      if (!optimisticWorkspace) {
        // Update was successful, but we need to refresh the folders in the workspace
        const workspaceResponse = await fetch(`/api/workspace/${activeWorkspace.id}`);
        
        if (workspaceResponse.ok) {
          const updatedWorkspace = await workspaceResponse.json();
          
          // Update the local state with the new workspace data
          setWorkspaces(workspaces.map(ws => 
            ws.id === updatedWorkspace.id ? updatedWorkspace : ws
          ));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating folder position:', error);
      toast.error('Failed to update folder position');

      // If we used an optimistic update but the request failed, revert to the original workspace
      if (optimisticWorkspace) {
        const workspaceResponse = await fetch(`/api/workspace/${activeWorkspace.id}`);
        if (workspaceResponse.ok) {
          const originalWorkspace = await workspaceResponse.json();
          setWorkspaces(workspaces.map(ws => 
            ws.id === activeWorkspace.id ? originalWorkspace : ws
          ));
        }
      }
      
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateFolderPositions,
    isUpdating,
  };
} 