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
import CustomNode from './nodes/CustomNode';
import CustomSmoothStepEdge from './edges/CustomSmoothStepEdge';
import AddBlockDropdownMenu from '@/app/workspace/[id]/[workflowId]/reactflow/components/AddBlockDropdownMenu';
import { Block } from '@/types/block';
import { NodeData, EdgeData, DropdownDatas, Path } from '../types';
import path from 'path';
import { processPath } from '../utils/processPath';
import BeginNode from './nodes/BeginNode';
import EndNode from './nodes/EndNode';
import SmoothStepCustomParent from './edges/SmoothStepCustomParent';
import { BlockEndType } from '@/types/block';
import LastNode from './nodes/LastNode';
import PathNode from './nodes/PathNode';
import { useModalStore } from '../store/modalStore';
import CreateParallelPathModal from './modals/CreateParallelPathModal';
import { createParallelPaths } from '../utils/createParallelPaths';
import StrokeEdge from './edges/StrokeEdge';
import ConnectNodeModal from './modals/ConnectNodeModal';
import { useConnectModeStore } from '../store/connectModeStore';
import { PathSelectionBox } from './PathSelectionBox';
import MergeNode from './nodes/MergeNode';
import { usePathsStore } from '../store/pathsStore';
import { UpdatePathSelectionBox } from './UpdatePathSelectionBox';

type StrokeLineVisibility = [number, boolean];

const nodeTypes = {
  custom: CustomNode,
  begin: BeginNode,
  end: EndNode,
  last: LastNode,
  path: PathNode,
  merge: MergeNode,
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
  const { fitView, setCenter, getNode, getNodes } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownDatas, setDropdownDatas] = useState<DropdownDatas | null>(
    null
  );
  const isFirstRender = useRef(true);
  const [strokeLineVisibilities, setStrokeLineVisibilities] = useState<
    StrokeLineVisibility[]
  >([]);
  const [allStrokeLinesVisible, setAllStrokeLinesVisible] = useState(true);
  const [previewEdge, setPreviewEdge] = useState<Edge | null>(null);
  const { isConnectMode, setIsConnectMode, setSourceBlockId, reset } =
    useConnectModeStore();

  // Get viewport dimensions from ReactFlow store
  const viewportWidth = useStore((store) => store.width);
  const viewportHeight = useStore((store) => store.height);

  const setAllPaths = usePathsStore((state) => state.setPaths);

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

  const updateStrokeLineVisibility = useCallback(
    (blockId: number, isVisible: boolean) => {
      setStrokeLineVisibilities((prev) => {
        const existing = prev.find(([id]) => id === blockId);
        if (existing) {
          return prev.map(([id, vis]) =>
            id === blockId ? [id, isVisible] : [id, vis]
          );
        }
        return [...prev, [blockId, isVisible]];
      });
    },
    []
  );

  // Initialize stroke line visibilities separately
  useEffect(() => {
    if (paths) {
      const initialVisibilities: StrokeLineVisibility[] = [];
      paths.forEach((path) => {
        path.blocks.forEach((block) => {
          initialVisibilities.push([block.id, true]);
        });
      });
      setStrokeLineVisibilities(initialVisibilities);
    }
  }, [paths]);

  // Main effect for creating nodes and edges
  useEffect(() => {
    if (!Array.isArray(paths)) return;

    const createLayoutedNodes = async () => {
      const firstPath = paths.find((path) => path.parent_blocks.length === 0);
      if (firstPath) {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        processPath(
          firstPath,
          nodes,
          edges,
          handleDeleteBlock,
          handleAddBlockOnEdge,
          new Set<string>(),
          setPaths,
          setStrokeLines,
          updateStrokeLineVisibility,
          strokeLineVisibilities
        );

        // Add stroke edges with visibility check
        const strokeEdges: Edge[] = strokeLines.map((strokeLine) => {
          const isSelfLoop =
            strokeLine.source_block_id === strokeLine.target_block_id;
          const visibility =
            strokeLineVisibilities.find(
              ([id]) => id === strokeLine.source_block_id
            )?.[1] ?? true;

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
              label: strokeLine.label,
              onStrokeLinesUpdate: setStrokeLines,
              isVisible: visibility,
            },
            style: { zIndex: 1000 },
          };
        });

        const allEdges = [...edges, ...strokeEdges];
        setEdges(allEdges);

        // Only layout the nodes
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
    updateStrokeLineVisibility,
    strokeLineVisibilities,
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

  const toggleAllStrokeLines = useCallback(() => {
    setAllStrokeLinesVisible((prev) => !prev);
    // Update all stroke line visibilities
    const blockIds = new Set<number>();
    paths.forEach((path) => {
      path.blocks.forEach((block) => {
        blockIds.add(block.id);
      });
    });

    blockIds.forEach((blockId) => {
      updateStrokeLineVisibility(blockId, !allStrokeLinesVisible);
    });
  }, [paths, allStrokeLinesVisible, updateStrokeLineVisibility]);

  // Combine regular edges with preview edge
  const allEdges = useMemo(() => {
    console.log('is previewEdge: ', previewEdge);
    return previewEdge ? [...edges, previewEdge] : edges;
  }, [edges, previewEdge]);

  const showConnectModal = useModalStore((state) => state.showConnectModal);
  const connectData = useModalStore((state) => state.connectData);
  const setShowConnectModal = useModalStore(
    (state) => state.setShowConnectModal
  );

  const handleConnect = useCallback(
    async (targetNodeId: string, label: string) => {
      try {
        const sourceNode = nodes.find(
          (node) => node.id === connectData?.sourceNode.id
        );

        if (!sourceNode?.data.path) {
          throw new Error('Source path not found');
        }

        const response = await fetch('/api/stroke-lines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source_block_id: parseInt(sourceNode.id.replace('block-', '')),
            target_block_id: parseInt(targetNodeId.replace('block-', '')),
            workflow_id: parseInt(workflowId),
            label: label,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create connection');
        }

        // Close modal
        setShowConnectModal(false);

        // Fetch updated stroke lines
        const strokeLinesResponse = await fetch(
          `/api/stroke-lines?workflow_id=${parseInt(workflowId)}`
        );
        if (strokeLinesResponse.ok) {
          const strokeLines = await strokeLinesResponse.json();
          setStrokeLines(strokeLines);
        }
      } catch (error) {
        console.error('Error creating connection:', error);
      }
    },
    [nodes, connectData, setShowConnectModal, setStrokeLines]
  );

  useEffect(() => {
    if (showConnectModal && connectData?.sourceNode) {
      setIsConnectMode(true);
      setSourceBlockId(connectData.sourceNode.id);
    } else {
      reset(); // This will clear all states including sourceBlockId
    }
  }, [
    showConnectModal,
    connectData,
    setIsConnectMode,
    setSourceBlockId,
    reset,
  ]);

  useEffect(() => {
    if (isConnectMode && connectData?.sourceNode) {
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          className: `${node.className || ''} ${
            node.id === connectData.sourceNode.id ? 'source-node' : ''
          } ${node.id === selectedNodeId ? 'selected-node' : ''}`,
        }))
      );
    } else {
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          className: node.className
            ?.replace('source-node', '')
            .replace('selected-node', ''),
        }))
      );
    }
  }, [isConnectMode, connectData, selectedNodeId]);

  useEffect(() => {
    const handlePathsUpdate = (event: CustomEvent) => {
      setPaths(event.detail);
    };

    window.addEventListener('updatePaths', handlePathsUpdate as EventListener);

    return () => {
      window.removeEventListener(
        'updatePaths',
        handlePathsUpdate as EventListener
      );
    };
  }, [setPaths]);

  useEffect(() => {
    setAllPaths(paths);
  }, [paths, setAllPaths]);

  return (
    <div
      className={`h-screen w-full transition-colors duration-300 ${
        isConnectMode ? 'bg-[#111111]' : 'bg-white'
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={allEdges}
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
        className={`bg-gray-50 transition-all duration-300 ${
          isConnectMode ? 'connect-mode' : ''
        }`}
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <PathSelectionBox />
      <UpdatePathSelectionBox
        workspaceId={workspaceId}
        workflowId={workflowId}
      />
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

      {showConnectModal && connectData && connectData.sourceNode && (
        <ConnectNodeModal
          onClose={() => {
            setPreviewEdge(null);
            setShowConnectModal(false);
          }}
          onConfirm={handleConnect}
          sourceNode={
            nodes.find((node) => node.id === connectData.sourceNode.id) as Node
          }
          availableNodes={getNodes()}
          onPreviewUpdate={setPreviewEdge}
        />
      )}
    </div>
  );
}
