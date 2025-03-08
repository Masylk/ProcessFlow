import '@xyflow/react/dist/style.css';

import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useStore,
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
import SmoothStepCustomParent from './SmoothStepCustomParent';
import { BlockEndType } from '@/types/block';
import LastNode from './LastNode';
import PathNode from './PathNode';
import { useModalStore } from '../store/modalStore';
import CreateParallelPathModal from './CreateParallelPathModal';
import { createParallelPaths } from '../utils/createParallelPaths';
import StrokeEdge from './StrokeEdge';

const nodeTypes = {
  custom: CustomNode,
  begin: BeginNode,
  end: EndNode,
  last: LastNode,
  path: PathNode,
} as const;

const edgeTypes = {
  smoothstepCustom: CustomSmoothStepEdge,
  smoothstepCustomParent: SmoothStepCustomParent,
  strokeEdge: StrokeEdge,
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
  strokeLines: any[];
  setStrokeLines: React.Dispatch<React.SetStateAction<any[]>>;
}

export function Flow({
  workflowName,
  paths,
  workspaceId,
  workflowId,
  onBlockAdd,
  setPaths,
  strokeLines,
  setStrokeLines,
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

  // Get viewport dimensions from ReactFlow store
  const viewportWidth = useStore((store) => store.width);
  const viewportHeight = useStore((store) => store.height);

  // Calculate bounds based on viewport size
  const translateExtent = useMemo((): [[number, number], [number, number]] => {
    const padding = 2000;

    if (nodes.length === 0)
      return [
        [-1000, -1000],
        [1000, 1000],
      ];

    const xPositions = nodes.map((node) => node.position.x);
    const yPositions = nodes.map((node) => node.position.y);

    const minX = Math.min(...xPositions) - padding;
    const maxX = Math.max(...xPositions) + padding;
    const minY = Math.min(...yPositions) - padding;
    const maxY = Math.max(...yPositions) + padding;

    return [
      [minX, minY],
      [maxX, maxY],
    ];
  }, [nodes]);

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
        console.log('path', path);
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
      const firstPath = paths.find((path) => path.parent_blocks.length === 0);
      if (firstPath) {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Process regular path nodes and edges
        processPath(
          firstPath,
          nodes,
          edges,
          handleDeleteBlock,
          handleAddBlockOnEdge,
          paths,
          new Set<string>(),
          setPaths,
          setStrokeLines
        );

        // Add stroke edges
        const strokeEdges: Edge[] = strokeLines.map((strokeLine) => {
          const isSelfLoop =
            strokeLine.source_block_id === strokeLine.target_block_id;
          return {
            id: `stroke-edge-${strokeLine.id}`,
            source: `block-${strokeLine.source_block_id}`,
            target: `block-${strokeLine.target_block_id}`,
            sourceHandle: 'stroke_source',
            targetHandle: isSelfLoop ? 'stroke_self_target' : 'stroke_target',
            type: 'strokeEdge',
            data: {
              source: `block-${strokeLine.source_block_id}`,
              target: `block-${strokeLine.target_block_id}`,
              onStrokeLinesUpdate: setStrokeLines,
            },
            // Set zIndex to ensure stroke edges appear above regular edges
            style: { zIndex: 1000 },
          };
        });

        setNodes(nodes);
        // Combine regular edges with stroke edges
        setEdges([...edges, ...strokeEdges]);

        // Only layout the nodes, not the edges
        const layoutedNodes = await createElkLayout(
          nodes,
          edges.filter((e) => !e.type?.includes('stroke'))
        );
        setNodes(layoutedNodes);
      }
    };
    createLayoutedNodes();
  }, [
    paths,
    strokeLines,
    handleDeleteBlock,
    handleAddBlockOnEdge,
    setPaths,
    setStrokeLines,
  ]);

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

  const showParallelPathModal = useModalStore(
    (state) => state.showParallelPathModal
  );
  const modalData = useModalStore((state) => state.modalData);
  const setShowModal = useModalStore((state) => state.setShowModal);

  const handleCreateParallelPaths = async (data: {
    paths_to_create: string[];
    path_to_move: number;
  }) => {
    try {
      setShowModal(false);
      if (modalData.path) {
        // Create parallel paths using the modal data
        await createParallelPaths(modalData.path, modalData.position, {
          paths_to_create: data.paths_to_create,
          path_to_move: data.path_to_move,
        });

        // Fetch updated paths data
        const pathsResponse = await fetch(
          `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
        );
        if (pathsResponse.ok) {
          const pathsData = await pathsResponse.json();
          setPaths(pathsData.paths);
        }
      }
    } catch (error) {
      console.error('Error creating parallel paths:', error);
    }
  };

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
        translateExtent={translateExtent}
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
          onClose={() => {
            console.log('closing dropdown');
            setShowDropdown(false);
          }}
          workspaceId={workspaceId}
          workflowId={workflowId}
          onPathsUpdate={setPaths}
        />
      )}

      {showParallelPathModal && modalData.path && (
        <CreateParallelPathModal
          onClose={() => setShowModal(false)}
          onConfirm={handleCreateParallelPaths}
          path={modalData.path}
          position={modalData.position}
          existingPaths={modalData.existingPaths}
        />
      )}
    </div>
  );
}
