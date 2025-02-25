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
import AddBlockDropdownMenu from '@/app/components/AddBlockDropdownMenu';
import { Block } from '@/types/block';
import { NodeData, EdgeData, DropdownPosition } from '../types';

const nodeTypes = {
  custom: CustomNode,
} as const;

const edgeTypes = {
  smoothstepCustom: CustomSmoothStepEdge,
} as const;

interface FlowProps {
  workflowName: string;
  blocks: Block[];
  workspaceId: string;
  workflowId: string;
  onBlockAdd: (
    blockData: any,
    path_id: number,
    position: number
  ) => Promise<void>;
  setBlocks: (blocks: Block[]) => void;
}

export function Flow({
  workflowName,
  blocks,
  workspaceId,
  workflowId,
  onBlockAdd,
  setBlocks,
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
            setBlocks(pathsData.paths?.[0]?.blocks || []);
          }
        }
      } catch (error) {
        console.error('Error deleting block:', error);
      }
    },
    [workspaceId, workflowId, setBlocks]
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
    if (!Array.isArray(blocks)) return;

    const createNodesAndLayout = async () => {
      // Sort blocks by path_id first, then by position
      const sortedBlocks = [...blocks].sort((a, b) => {
        if (a.path_id !== b.path_id) {
          return a.path_id - b.path_id;
        }
        return a.position - b.position;
      });

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      console.log('Sorted Blocks:', sortedBlocks);

      // First create all nodes
      sortedBlocks.forEach((block) => {
        const nodeId = `block-${block.id}`;
        console.log('Creating node:', nodeId);

        newNodes.push({
          id: nodeId,
          type: 'custom',
          position: { x: 0, y: 0 },
          data: {
            label: block.step_block?.stepDetails || 'Block',
            position: block.position,
            onDelete: handleDeleteBlock,
            pathId: block.path_id,
            handleAddBlockOnEdge,
            isLastInPath: true,
          },
        });
      });

      // Then create edges in a separate loop
      sortedBlocks.forEach((block) => {
        // Find the previous block in the same path
        const prevBlock = sortedBlocks.find(
          (b) =>
            b.path_id === block.path_id && b.position === block.position - 1
        );

        if (prevBlock) {
          const sourceId = `block-${prevBlock.id}`;
          const targetId = `block-${block.id}`;
          const edgeId = `edge-${prevBlock.id}-${block.id}`;

          console.log('Creating edge:', { sourceId, targetId, edgeId });

          newEdges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            type: 'smoothstepCustom',
            sourceHandle: 'bottom',
            targetHandle: 'top',
            style: { stroke: '#b1b1b7' },
            animated: true,
            data: {
              blocks: sortedBlocks,
              handleAddBlockOnEdge,
            },
          });

          // Update isLastInPath flag
          const prevNodeIndex = newNodes.findIndex((n) => n.id === sourceId);
          if (prevNodeIndex !== -1) {
            newNodes[prevNodeIndex].data.isLastInPath = false;
          }
        }
      });

      console.log('Before layout - Nodes:', newNodes);
      console.log('Before layout - Edges:', newEdges);

      const layoutedNodes = await createElkLayout(newNodes, newEdges);
      console.log('After layout - Nodes:', layoutedNodes);

      // Ensure nodes have positions
      const nodesWithPositions = layoutedNodes.map((node) => {
        if (
          !node.position ||
          (node.position.x === 0 && node.position.y === 0)
        ) {
          console.error('Node missing position:', node);
        }
        return node;
      });

      // Force a rerender with the new positions
      setNodes([]);
      setTimeout(() => {
        setNodes(nodesWithPositions);
        setEdges(newEdges);

        // Fit view after a short delay to ensure nodes are rendered
        if (isFirstRender.current) {
          setTimeout(() => {
            fitView({
              padding: 0.5,
              duration: 200,
              minZoom: 0.5,
              maxZoom: 1,
            });
            isFirstRender.current = false;
          }, 200);
        }
      }, 50);
    };

    createNodesAndLayout();
  }, [blocks, handleDeleteBlock, handleAddBlockOnEdge, fitView]);

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
