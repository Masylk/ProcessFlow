'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from './components/Header';
import Sidebar from './components/Sidebar'; // Import the Sidebar component
import { Workspace } from '@/types/workspace';
import { Workflow } from '@/types/workflow';

const WorkspacePage = () => {
  const { id, workflow_id } = useParams(); // Get workspace and workflow IDs from the URL
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState<string | null>(null);
  const [stepCount, setStepCount] = useState<number>(0); // State to store the number of STEP blocks
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!id || !workflow_id) return;

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
          (w: Workflow) => w.id === parseInt(workflow_id.toString(), 10)
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
  }, [id, workflow_id]);

  return (
    <div className="flex h-screen">
      {workflow && <Sidebar stepCount={stepCount} blocks={workflow.blocks} />}
      {/* Main Content */}
      <div className="flex-1">
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
    </div>
  );
};

export default WorkspacePage;
