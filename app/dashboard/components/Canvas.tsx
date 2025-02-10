'use client';

import { Folder, Workspace } from '@/types/workspace';
import React from 'react';
import CanvaHeader from './CanvaHeader';
import { useRouter } from 'next/navigation'; // Import the useRouter hook
import WorkflowCard from './WorkflowCard';
import { Workflow } from '@/types/workflow';

interface CanvasProps {
  workspace: Workspace;
  openCreateFlow: () => void;
  onSelectWorkflow: (w: Workflow) => void;
  onDeleteWorkflow: () => void;
  onEditWorkflow: () => void;
  onDuplicateWorkflow: () => void;
  onMoveWorkflow: () => void;
  selectedFolder?: Folder;
  searchTerm?: string;
}

const Canvas: React.FC<CanvasProps> = ({
  workspace,
  selectedFolder,
  openCreateFlow,
  onSelectWorkflow,
  onDeleteWorkflow,
  onEditWorkflow,
  onDuplicateWorkflow,
  onMoveWorkflow,
  searchTerm = '',
}) => {
  const router = useRouter(); // Initialize the router

  const handleWorkflowClick = (workflowId: number) => {
    // Redirect to the workflow edit page
    router.push(`/workspace/${workspace.id}/${workflowId}/edit`);
  };

  // Filter workflows based on the selectedFolder and searchTerm
  const workflowsToDisplay = workspace.workflows.filter((workflow) => {
    const matchesFolder = selectedFolder
      ? workflow.folder_id === selectedFolder.id
      : true;
    const matchesSearch = workflow.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-gray-100 ">
      <CanvaHeader
        openCreateFlow={openCreateFlow}
        selectedFolder={selectedFolder}
      />

      <div className="w-full py-4 pb-40 px-8 grid grid-cols-4 gap-4 overflow-auto">
        {workflowsToDisplay.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            workspace={workspace}
            onSelectWorkflow={onSelectWorkflow}
            onDeleteWorkflow={onDeleteWorkflow}
            onDuplicateWorkflow={onDuplicateWorkflow}
            onEditWorkflow={onEditWorkflow}
            onMoveWorkflow={onMoveWorkflow}
          />
        ))}
      </div>
    </div>
  );
};

export default Canvas;
