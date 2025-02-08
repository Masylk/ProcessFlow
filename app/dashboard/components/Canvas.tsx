'use client';

import { Folder, Workspace } from '@/types/workspace';
import React from 'react';
import CanvaHeader from './CanvaHeader';
import { useRouter } from 'next/navigation'; // Import the useRouter hook

interface CanvasProps {
  workspace: Workspace;
  selectedFolder?: Folder;
  openCreateFlow: () => void;
}

const Canvas: React.FC<CanvasProps> = ({
  workspace,
  selectedFolder,
  openCreateFlow,
}) => {
  const router = useRouter(); // Initialize the router

  const handleWorkflowClick = (workflowId: number) => {
    // Redirect to the workflow edit page
    router.push(`/workspace/${workspace.id}/${workflowId}/edit`);
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-gray-100 border border-gray-300 p-4 rounded-lg shadow-md">
      <CanvaHeader
        openCreateFlow={openCreateFlow}
        selectedFolder={selectedFolder}
      />
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        {selectedFolder ? selectedFolder.name : workspace.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {workspace.workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => handleWorkflowClick(workflow.id)} // Handle click event
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {workflow.name}
            </h2>
            <p className="text-sm text-gray-600">{workflow.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Canvas;
