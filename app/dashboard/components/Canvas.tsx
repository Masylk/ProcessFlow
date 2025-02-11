'use client';

import { Folder, Workspace } from '@/types/workspace';
import React from 'react';
import CanvaHeader from './CanvaHeader';
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
  // Filter workflows based on selectedFolder and searchTerm
  const workflowsToDisplay = workspace.workflows.filter((workflow) => {
    const matchesFolder = selectedFolder
      ? workflow.folder_id === selectedFolder.id
      : true;
    const matchesSearch = workflow.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  // Sort workflows by last_opened (recently used first)
  const recentlyUsedWorkflows = [...workflowsToDisplay]
    .filter((workflow) => workflow.last_opened) // Ensure last_opened exists
    .sort(
      (a, b) =>
        new Date(b.last_opened!).getTime() - new Date(a.last_opened!).getTime()
    )
    .slice(0, 4); // Get the top 4 most recent workflows

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-gray-100">
      <CanvaHeader
        openCreateFlow={openCreateFlow}
        selectedFolder={selectedFolder}
      />

      {/* Scrollable Section */}
      <div className="flex-1 overflow-auto px-8 py-4">
        {/* Recently Used Section */}
        {recentlyUsedWorkflows.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Recently Used</h2>
            <div className="grid grid-cols-4 gap-4">
              {recentlyUsedWorkflows.map((workflow) => (
                <WorkflowCard
                  key={workflow.id}
                  workflow={workflow}
                  workspace={workspace}
                  onSelectWorkflow={onSelectWorkflow}
                  onDuplicateWorkflow={onDuplicateWorkflow}
                  onDeleteWorkflow={onDeleteWorkflow}
                  onEditWorkflow={onEditWorkflow}
                  onMoveWorkflow={onMoveWorkflow}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Workflows Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Workflows</h2>
          <div className="grid grid-cols-4 gap-4 pb-40">
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
      </div>
    </div>
  );
};

export default Canvas;
