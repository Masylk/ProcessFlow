'use client';
import React, { useEffect, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Flow } from './Flow';
import { Block } from '@/types/block';

interface ReactFlowPageClientProps {
  workspaceId: string;
  workflowId: string;
}

export function ReactFlowPageClient({
  workspaceId,
  workflowId,
}: ReactFlowPageClientProps) {
  const [workflowName, setWorkflowName] = useState<string>('');
  const [blocks, setBlocks] = useState<Block[]>([]);

  const handleBlockAdd = async (
    blockData: any,
    path_id: number,
    position: number
  ) => {
    const response = await fetch('/api/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blockData),
    });

    if (response.ok) {
      const pathsResponse = await fetch(
        `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
      );
      if (pathsResponse.ok) {
        const pathsData = await pathsResponse.json();
        if (pathsData.paths?.[0]?.blocks) setBlocks(pathsData.paths[0].blocks);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const [workflowRes, pathsRes] = await Promise.all([
        fetch(`/api/workspace/${workspaceId}/workflows/${workflowId}`),
        fetch(`/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`),
      ]);

      const workflow = await workflowRes.json();
      setWorkflowName(workflow.name);
      console.log('Workflow:', workflow);

      const pathsData = await pathsRes.json();
      console.log('Paths Data:', pathsData);
      console.log('Blocks:', pathsData.paths?.[0]?.blocks);

      setBlocks(pathsData.paths?.[0]?.blocks || []);
    };
    fetchData();
  }, [workspaceId, workflowId]);

  return (
    <ReactFlowProvider>
      <Flow
        workflowName={workflowName}
        blocks={blocks}
        workspaceId={workspaceId}
        workflowId={workflowId}
        onBlockAdd={handleBlockAdd}
        setBlocks={setBlocks}
      />
    </ReactFlowProvider>
  );
}
