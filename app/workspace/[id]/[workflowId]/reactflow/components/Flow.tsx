import '@xyflow/react/dist/style.css';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
} from '@xyflow/react';
import { createElkLayout } from '../utils/elkLayout';
import CustomNode from './CustomNode';
import CustomSmoothStepEdge from './CustomSmoothStepEdge';
import AddBlockDropdownMenu from '@/app/workspace/[id]/[workflowId]/reactflow/components/AddBlockDropdownMenu';
import { Block } from '@/types/block';
import { NodeData, EdgeData, DropdownDatas, Path } from '../types';
import path from 'path';
import { processPath } from '../utils/processPath';
import BeginNode from './BeginNode';
import EndNode from './EndNode';

const nodeTypes = {
  custom: CustomNode,
  begin: BeginNode,
  end: EndNode,
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
  const { fitView, setCenter } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownDatas, setDropdownDatas] = useState<DropdownDatas | null>(
    null
  );
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
      path: Path,
      event?: { clientX: number; clientY: number }
    ) => {
      if (event) {
        setDropdownDatas({
          x: event.clientX,
          y: event.clientY,
          position,
          path: path,
        });
        setShowDropdown(true);
      }
    },
    []
  );

  useEffect(() => {
    if (!Array.isArray(paths)) return;

    const createLayoutedNodes = async () => {
      console.log('allo');
      const firstPath = paths.find((path) => path.parent_blocks.length === 0);
      if (firstPath) {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        processPath(
          firstPath,
          nodes,
          edges,
          handleDeleteBlock,
          handleAddBlockOnEdge
        );
        setNodes(nodes);
        setEdges(edges);
        const layoutedNodes = await createElkLayout(nodes, edges);
        setNodes(layoutedNodes);
      }
    };
    createLayoutedNodes();
  }, [paths, handleDeleteBlock, handleAddBlockOnEdge, fitView]);

  const handleBlockTypeSelect = useCallback(
    async (blockType: 'STEP' | 'PATH' | 'DELAY') => {
      if (!dropdownDatas) return;

      const defaultBlock = {
        type: blockType,
        workflow_id: parseInt(workflowId),
        position: dropdownDatas.position,
        path_id: dropdownDatas.path.id,
      };

      setShowDropdown(false);
      await onBlockAdd(
        defaultBlock,
        dropdownDatas.path.id,
        defaultBlock.position
      );
    },
    [dropdownDatas, workflowId, onBlockAdd]
  );

  // Fix the handleNodeFocus function to avoid infinite loops
  const handleNodeFocus = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);

      // Find the node in our nodes array - use functional update pattern
      setNodes((currentNodes) => {
        const node = currentNodes.find((n) => n.id === nodeId);
        if (node) {
          // Center the view on the node
          setCenter(node.position.x, node.position.y, {
            zoom: 1.5,
            duration: 800,
          });

          // Highlight the node with functional update pattern
          return currentNodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              highlighted: n.id === nodeId,
            },
          }));
        }
        return currentNodes;
      });

      // Reset highlight after a delay - use functional update to avoid closure issues
      setTimeout(() => {
        setNodes((currentNodes) =>
          currentNodes.map((n) => ({
            ...n,
            data: {
              ...n.data,
              highlighted: false,
            },
          }))
        );
      }, 2000);
    },
    [setCenter]
  ); // Only depend on stable function, not nodes state

  return (
    <div className="h-screen w-screen relative">
      {/* Include the Sidebar component */}
      {/* <Sidebar 
        blocks={blocks}
        workspaceId={workspaceId} 
        workflowId={workflowId}
        onNodeFocus={handleNodeFocus}
      /> */}

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
        fitView={true}
        panOnScroll
        panOnDrag
        zoomOnScroll
        selectionOnDrag={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        snapToGrid={true}
        snapGrid={[15, 15]}
        fitViewOptions={{
          padding: 0.5,
          duration: 200,
          minZoom: 0.5,
          maxZoom: 1,
          includeHiddenNodes: true,
        }}
        className="bg-gray-50"
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap /> {/* Added MiniMap as requested */}
      </ReactFlow>

      {showDropdown && dropdownDatas && (
        <AddBlockDropdownMenu
          dropdownDatas={dropdownDatas}
          onSelect={handleBlockTypeSelect}
          onClose={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
