'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from './components/Header';
import Sidebar from './components/Sidebar'; // Import the Sidebar component
import { Workspace } from '@/types/workspace';
import { Workflow } from '@/types/workflow';
import { Path } from '@/types/path';

const WorkspacePage = () => {
  const { id, workflowId } = useParams(); // Get workspace and workflow IDs from the URL
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState<string | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState<string>('');
  const [stepCount, setStepCount] = useState<number>(0); // State to store the number of STEP blocks
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [path, setPath] = useState<Path | null>(null);
  const [lastRequestStatus, setLastRequestStatus] = useState<boolean | null>(null);

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
          setWorkflow(workflow);
          setWorkflowName(workflow.name);

          // Count the number of STEP blocks
          const step_blocksCount = workflow.blocks.filter(
            (block) => block.type === 'STEP'
          ).length;
          setStepCount(step_blocksCount); // Set the count in the state
        } else {
          throw new Error('Workflow not found in the workspace');
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchWorkspace();
  }, [id, workflowId]);

  useEffect(() => {
    if (id && workflowId) {
      fetchPaths(id.toString(), workflowId.toString());
      fetchWorkflowTitle(workflowId.toString());
    }
  }, [id, workflowId]);

  const fetchPaths = async (id: string, workflow_id: string) => {
    try {
      const response = await fetch(
        `/api/workspace/${id}/paths?workflow_id=${workflow_id}`
      );
      if (!response.ok) throw new Error('Failed to fetch paths');

      const data = await response.json();
      setPath(data.paths && data.paths[0] ? data.paths[0] : null);
      setLastRequestStatus(true);
    } catch (error) {
      console.error('Error fetching paths:', error);
      setLastRequestStatus(false);
    }
  };

  const fetchWorkflowTitle = async (workflow_id: string) => {
    try {
      const response = await fetch(`/api/workflow/${workflow_id}/title`);
      if (!response.ok) throw new Error('Failed to fetch workflow title');

      const data = await response.json();
      setWorkflowTitle(data.title);
    } catch (error) {
      console.error('Error fetching workflow title:', error);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {path && (
        <Sidebar
          stepCount={path.blocks.length}
          path={path}
          workspaceId={parseInt(id.toString())}
        />
      )}
      {/* Main Content */}
      <div className="flex-1">
        {workspaceName && workflowTitle ? (
          <Header workspaceName={workspaceName} workflowName={workflowTitle} />
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
    </div>
  );
};

export default WorkspacePage;
