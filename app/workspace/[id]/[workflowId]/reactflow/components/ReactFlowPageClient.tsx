'use client';
import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Flow } from './Flow';
import { Block } from '@/types/block';
import { Path } from '../types';
import { getWorkflowStrokeLines } from '../utils/stroke-lines';

interface ReactFlowPageClientProps {
  workspaceId: string;
  workflowId: string;
}

export function ReactFlowPageClient({
  workspaceId,
  workflowId,
}: ReactFlowPageClientProps) {
  const [workflowName, setWorkflowName] = useState<string>('');
  const [paths, setPaths] = useState<Path[]>([]);
  const [strokeLines, setStrokeLines] = useState<any[]>([]);

  const handleBlockAdd = async (
    blockData: any,
    path_id: number,
    position: number
  ) => {
    // Ensure path_id is a number
    if (!path_id || typeof path_id !== 'number') {
      console.error('Invalid path_id:', path_id);
      return;
    }

    // Prepare the block data
    const data = {
      type: blockData.type,
      position: position,
      workflow_id: parseInt(workflowId),
      path_id: path_id,
      step_details: blockData.type === 'STEP' ? 'New Step' : undefined,
      icon:
        blockData.type === 'STEP'
          ? '/step-icons/default-icons/container.svg'
          : blockData.type === 'DELAY'
            ? '/step-icons/default-icons/delay.svg'
            : '/step-icons/default-icons/path.svg',
      description: `New ${blockData.type.toLowerCase()} block`,
      delay_seconds: blockData.type === 'DELAY' ? 60 : undefined, // Default 1 minute delay
    };

    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to add block:', errorData);
        return;
      }

      // Refresh paths data
      const pathsResponse = await fetch(
        `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
      );
      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        setPaths(pathsData.paths);
      }
    } catch (error) {
      console.error('Error adding block:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workflowRes, pathsRes] = await Promise.all([
          fetch(`/api/workspace/${workspaceId}/workflows/${workflowId}`),
          fetch(
            `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
          ),
        ]);

        const workflow = await workflowRes.json();
        setWorkflowName(workflow.name);

        const pathsData = await pathsRes.json();
        setPaths(pathsData.paths);

        // Fetch stroke lines
        const strokeLinesData = await getWorkflowStrokeLines(
          parseInt(workflowId)
        );
        if (strokeLinesData) {
          setStrokeLines(strokeLinesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [workspaceId, workflowId]);

  return (
    <ReactFlowProvider>
      <Flow
        workflowName={workflowName}
        paths={paths}
        workspaceId={workspaceId}
        workflowId={workflowId}
        onBlockAdd={handleBlockAdd}
        setPaths={setPaths}
        strokeLines={strokeLines}
        setStrokeLines={setStrokeLines}
      />
    </ReactFlowProvider>
  );
}
