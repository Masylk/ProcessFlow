'use client';
import React, { useEffect, useState } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { Flow } from './Flow';
import { NodeData, Path, Block } from '../../types';
import { getWorkflowStrokeLines } from '../utils/stroke-lines';
import WorkflowHeader from './WorkflowHeader';
import { useSearchParams } from 'next/navigation';
import { usePathsStore } from '../store/pathsStore';
import { Workspace } from '@/types/workspace';
import { toast } from 'sonner';

interface ReactFlowPageClientProps {
  workspaceId: string;
  workflowId: string;
}

export function ReactFlowPageClient({
  workspaceId,
  workflowId,
}: ReactFlowPageClientProps) {
  const [workflowName, setWorkflowName] = useState<string>('');
  const [strokeLines, setStrokeLines] = useState<any[]>([]);
  const [parentFolder, setParentFolder] = useState<string | undefined>();
  const [grandParentFolder, setGrandParentFolder] = useState<
    string | undefined
  >();
  const [workspace, setWorkspace] = useState<Workspace | undefined>();
  const setPaths = usePathsStore((state) => state.setPaths);
  const paths = usePathsStore((state) => state.paths);
  const [newBlockId, setNewBlockId] = useState<number | null>(null);

  const searchParams = useSearchParams();

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

    // Find the blocks array for the given path_id
    const path = paths.find((p) => p.id === path_id);
    const blocksLength = path?.blocks?.length ?? 0;
    // Cap position to (blocksLength - 1), but not less than 0
    const cap = Math.max(1, blocksLength - 1);
    const cappedPosition = Math.min(position, cap);

    // Prepare the block data
    const data = {
      type: blockData.type,
      position: cappedPosition,
      workflow_id: parseInt(workflowId),
      path_id: path_id,
      step_details: blockData.type === 'STEP' ? '' : undefined,
      icon:
        blockData.type === 'STEP'
          ? '/step-icons/default-icons/container.svg'
          : blockData.type === 'DELAY'
            ? '/step-icons/default-icons/delay.svg'
            : '/step-icons/default-icons/path.svg',
      description: '',
      delay_type: blockData.delay_type,
      delay_event: blockData.delay_event,
      delay_seconds: blockData.delay_seconds,
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

      // Get the newly created block's ID from the response
      const newBlock = await response.json();

      // Update paths locally instead of refetching
      setPaths((prevPaths) => {
        return prevPaths.map((p) => {
          if (p.id !== path_id) return p;
          // Insert the new block at the correct position
          const blocks = Array.isArray(p.blocks) ? [...p.blocks] : [];
          const insertAt = Math.min(newBlock.position, blocks.length);
          blocks.splice(insertAt, 0, newBlock);
          // Update positions of all blocks after the inserted one
          for (let i = insertAt + 1; i < blocks.length; i++) {
            blocks[i] = {
              ...blocks[i],
              position: (blocks[i].position ?? i - 1) + 1,
            };
          }
          return { ...p, blocks };
        });
      });
      setNewBlockId(newBlock.id);
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
        setWorkspace(workflow.workspace);
        setParentFolder(workflow.folder?.name);
        setGrandParentFolder(workflow.folder?.parent?.name);

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
  }, [workspaceId, workflowId, setPaths]);

  return (
    <div className="h-screen flex flex-col">
      <WorkflowHeader
        workflowId={workflowId}
        parentFolder={parentFolder}
        grandParentFolder={grandParentFolder}
        slug={workspace?.name}
      />
      <div className="pt-[56px] flex-1 h-[calc(100vh-56px)]">
        <ReactFlowProvider>
          <Flow
            workflowName={workflowName}
            workspaceId={workspaceId}
            workflowId={workflowId}
            onBlockAdd={handleBlockAdd}
            strokeLines={strokeLines}
            setStrokeLines={setStrokeLines}
            newBlockId={newBlockId}
            clearNewBlockId={() => setNewBlockId(null)}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
