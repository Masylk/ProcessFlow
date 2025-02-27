import '@xyflow/react/dist/style.css';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useReactFlow,
  Background,
  Controls,
} from '@xyflow/react';
import { createElkLayout } from '../utils/elkLayout';
import CustomNode from './CustomNode';
import CustomSmoothStepEdge from './CustomSmoothStepEdge';
import AddBlockDropdownMenu from '@/app/workspace/[id]/[workflowId]/reactflow/components/AddBlockDropdownMenu';
import { Block } from '@/types/block';
import { NodeData, EdgeData, DropdownPosition, Path } from '../types';
import path from 'path';
import { processPath } from '../utils/processPath';

const nodeTypes = {
  custom: CustomNode,
} as const;

const edgeTypes = {
  smoothstepCustom: CustomSmoothStepEdge,
} as const;

interface FlowProps {
  workflowName: string;
  paths: Path[];
  workspaceId: string;
  workflowId: string;
  onBlockAdd: (
    blockData: any,
    path_id: number,
    position: number
  ) => Promise<void>;
  setPaths: (paths: Path[]) => void;
}

export function Flow({
  workflowName,
  paths,
  workspaceId,
  workflowId,
  onBlockAdd,
  setPaths,
}: FlowProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { fitView } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] =
    useState<DropdownPosition | null>(null);
  const isFirstRender = useRef(true);

  const handleDeleteBlock = useCallback(
    async (nodeId: string) => {
      const blockId = nodeId.replace('block-', '');
      try {
        const response = await fetch(`/api/blocks/${blockId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          const pathsResponse = await fetch(
            `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
          );
          if (pathsResponse.ok) {
            const pathsData = await pathsResponse.json();
            setPaths(pathsData.paths);
          }
        }
      } catch (error) {
        console.error('Error deleting block:', error);
      }
    },
    [workspaceId, workflowId, setPaths]
  );

  const handleAddBlockOnEdge = useCallback(
    (
      position: number,
      path_id: number | null,
      event?: { clientX: number; clientY: number }
    ) => {
      if (event) {
        setDropdownPosition({
          x: event.clientX,
          y: event.clientY,
          position,
          pathId: path_id,
        });
        setShowDropdown(true);
      }
    },
    []
  );

  useEffect(() => {
    if (!Array.isArray(paths)) return;
    const firstPath = paths.find((path) => path.parent_blocks.length === 0);
    if (firstPath) {
      const nodes: Node[] = [];
      const edges: Edge[] = [];
      processPath(firstPath, nodes, edges, handleDeleteBlock, handleAddBlockOnEdge);
      setNodes(nodes);
      setEdges(edges);
    }
  }, [paths, handleDeleteBlock, handleAddBlockOnEdge, fitView]);

  const handleBlockTypeSelect = useCallback(
    async (blockType: 'STEP' | 'PATH' | 'DELAY') => {
      if (!dropdownPosition) return;

      const defaultBlock = {
        type: blockType,
        workflow_id: parseInt(workflowId),
        position: dropdownPosition.position,
        path_id: dropdownPosition.pathId,
        step_data: 'New Block',
      };

      setShowDropdown(false);
      await onBlockAdd(
        defaultBlock,
        defaultBlock.path_id!,
        defaultBlock.position
      );
    },
    [dropdownPosition, workflowId, onBlockAdd]
  );

  return (
    <div className="h-screen w-screen border-4 border-red-500">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        translateExtent={[
          [-5000, -5000],
          [5000, 5000],
        ]}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        fitView={false}
        panOnScroll
        panOnDrag
        zoomOnScroll
        selectionOnDrag={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        fitViewOptions={{
          padding: 0.5,
          duration: 200,
          minZoom: 0.5,
          maxZoom: 1,
        }}
        className="bg-gray-50 border-2 border-red-300"
        style={{ zIndex: 0 }}
      >
        <Background gap={12} size={1} style={{ zIndex: -1 }} />
        <Controls style={{ zIndex: 2 }} />
      </ReactFlow>
      {showDropdown && dropdownPosition && (
        <AddBlockDropdownMenu
          position={{ x: dropdownPosition.x, y: dropdownPosition.y }}
          onSelect={handleBlockTypeSelect}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
