'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from './components/Header';
import { Workspace } from '@/types/workspace';
import { Workflow } from '@/types/workflow';

const WorkspacePage = () => {
  const { id, workflowId } = useParams(); // Get workspace and workflow IDs from the URL
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!id || !workflowId) return;

      try {
        const response = await fetch(`/api/workspace/${id}`);
        if (!response.ok) {
          throw new Error(`Error fetching workspace: ${response.statusText}`);
        }
        const data: Workspace = await response.json();

        // Set the workspace name
        setWorkspaceName(data.name);

        // Find the workflow by ID
        const workflow = data.workflows.find(
          (w: Workflow) => w.id === parseInt(workflowId.toString(), 10)
        );
        if (workflow) {
          setWorkflowName(workflow.name);
        } else {
          throw new Error('Workflow not found in the workspace');
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchWorkspace();
  }, [id, workflowId]);

  return (
    <div>
      {workspaceName && workflowName ? (
        <Header workspaceName={workspaceName} workflowName={workflowName} />
      ) : (
        ''
      )}
      <div className="p-4">
        {error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : workspaceName && workflowName ? (
          <>
            <h1 className="text-2xl font-bold">Workspace: {workspaceName}</h1>
            <h2 className="text-xl">Workflow: {workflowName}</h2>
          </>
        ) : (
          <p>Loading workspace and workflow...</p>
        )}
      </div>
    </div>
  );
};

export default WorkspacePage;
