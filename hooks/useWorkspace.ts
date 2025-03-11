// app/hooks/useWorkspace.ts
'use client';

import { useContext } from 'react';
import { createContext } from 'react';
import { Workspace } from '@/types/workspace';

interface WorkspaceContextType {
  workspace: Workspace | null;
}

const WorkspaceContext = createContext<WorkspaceContextType>({ workspace: null });

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

export const WorkspaceProvider = WorkspaceContext.Provider;