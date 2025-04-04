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
import {
  NodeData,
  EdgeData,
  DropdownDatas,
  Path,
  Block,
  DelayType,
} from '../../types';
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
import InvisibleNode from './nodes/InvisibleNode';
import { useEditModeStore } from '../store/editModeStore';
import { useSearchParams } from 'next/navigation';
import ZoomBar from './ZoomBar';
import { Sidebar } from './Sidebar';
import { useColors } from '@/app/theme/hooks';
import FixedDelayNode from './nodes/FixedDelayNode';
import EventDelayNode from './nodes/EventDelayNode';
import { useStrokeLinesStore } from '../store/strokeLinesStore';

type StrokeLineVisibility = [number, boolean];

const nodeTypes = {
  custom: CustomNode,
  begin: BeginNode,
  end: EndNode,
  last: LastNode,
  path: PathNode,
  merge: MergeNode,
  invisible: InvisibleNode,
  fixedDelay: FixedDelayNode,
  eventDelay: EventDelayNode,
} as const;

const edgeTypes = {
  smoothstepCustom: CustomSmoothStepEdge,
  smoothstepCustomParent: SmoothStepCustomParent,
  strokeEdge: StrokeEdge,
} as const;

interface FlowProps {
  workflowName: string;
  workspaceId: string;
  workflowId: string;
  onBlockAdd: (
    blockData: any,
    path_id: number,
    position: number
  ) => Promise<void>;
  strokeLines: any[];
  setStrokeLines: React.Dispatch<React.SetStateAction<any[]>>;
  newBlockId: number | null;
  clearNewBlockId: () => void;
}

export function Flow({
  workflowName,
  workspaceId,
  workflowId,
  onBlockAdd,
  strokeLines,
  setStrokeLines,
  newBlockId,
  clearNewBlockId,
}: FlowProps) {
  const colors = useColors();
  const { paths, setPaths } = usePathsStore();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { fitView, setCenter, getNode, getNodes, setViewport } = useReactFlow();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownDatas, setDropdownDatas] = useState<DropdownDatas | null>(
    null
  );
  const isFirstRender = useRef(true);
  const [strokeLineVisibilities, setStrokeLineVisibilities] = useState<
    StrokeLineVisibility[]
  >([]);
  const { allStrokeLinesVisible, setAllStrokeLinesVisible } = useStrokeLinesStore();
  const [previewEdge, setPreviewEdge] = useState<Edge | null>(null);
  const { isConnectMode, setIsConnectMode, setSourceBlockId, reset } =
    useConnectModeStore();
  const isEditMode = useEditModeStore((state) => state.isEditMode);
  const searchParams = useSearchParams();
  const [defaultViewport, setDefaultViewport] = useState({
    x: 0,
    y: 0,
    zoom: 1,
  });
  const { setEditMode } = useEditModeStore();

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
          // Update paths by filtering out the deleted block
          setPaths((currentPaths) => {
            const updatedPaths = currentPaths.map((path) => ({
              ...path,
              blocks: path.blocks.filter(
                (block) => block.id !== parseInt(blockId)
              ),
            }));
            return updatedPaths;
          });
        }
      } catch (error) {
        console.error('Error deleting block:', error);
      }
    },
    [setPaths]
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

  // Add state for linkNode
  const [linkNode, setLinkNode] = useState<Node | null>(null);

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
          strokeLineVisibilities,
          paths
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
            animated: true,
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

        // Check for blockId in URL and set viewport accordingly
        const blockId = searchParams.get('blockId');
        if (blockId) {
          const targetNode = layoutedNodes.find(
            (n) => n.id === `block-${blockId}`
          );
          if (targetNode) {
            console.log('targetNode', targetNode);
            setDefaultViewport({
              x: -(targetNode.position.x - window.innerWidth / 2),
              y: -(targetNode.position.y - window.innerHeight / 2),
              zoom: 1,
            });
            setLinkNode(targetNode);
          }
        }
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
    searchParams,
  ]);

  const handleBlockTypeSelect = async (
    blockType: 'STEP' | 'PATH' | 'DELAY',
    dropdownDatas: DropdownDatas,
    delayOptions?: {
      delayType?: DelayType;
      eventName?: string;
      seconds?: number;
    }
  ) => {
    try {
      console.log('delayOptions', delayOptions);
      // Validate delay options if it's a DELAY block
      if (blockType === 'DELAY') {
        if (!delayOptions?.delayType) {
          throw new Error('Delay type is required for DELAY blocks');
        }
        if (
          typeof delayOptions.seconds !== 'number' ||
          delayOptions.seconds < 0
        ) {
          throw new Error(
            'A valid delay value (non-negative number) is required for DELAY blocks'
          );
        }
        if (
          delayOptions.delayType === DelayType.WAIT_FOR_EVENT &&
          !delayOptions.eventName
        ) {
          throw new Error('Event name is required for event-based delays');
        }
      }

      const blockData = {
        type: blockType,
        position: dropdownDatas.position,
        path_id: dropdownDatas.path.id,
        delay_type: delayOptions?.delayType as string,
        delay_event: delayOptions?.eventName,
        delay_seconds: delayOptions?.seconds,
      };

      console.log('blockData', blockData);

      await onBlockAdd(
        blockData,
        dropdownDatas.path.id,
        dropdownDatas.position
      );
      setShowDropdown(false);
    } catch (error) {
      console.error('Error creating block:', error);
    }
  };

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
    const newVisibility = !allStrokeLinesVisible;
    setAllStrokeLinesVisible(newVisibility);
    
    // Update all stroke line visibilities
    const blockIds = new Set<number>();
    paths.forEach((path) => {
      path.blocks.forEach((block) => {
        blockIds.add(block.id);
      });
    });

    blockIds.forEach((blockId) => {
      updateStrokeLineVisibility(blockId, newVisibility);
    });
  }, [paths, allStrokeLinesVisible, updateStrokeLineVisibility, setAllStrokeLinesVisible]);

  // Combine regular edges with preview edge
  const allEdges = useMemo(() => {
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
          }`,
        }))
      );
    } else {
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          className: node.className?.replace('source-node', ''),
        }))
      );
    }
  }, [isConnectMode, connectData]);

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

  useEffect(() => {
    if (newBlockId && nodes.length > 0) {
      // Find the node with the new block ID
      const nodeId = `block-${newBlockId}`;
      const node = nodes.find((n) => n.id === nodeId);

      if (node) {
        // Set this node as selected in edit mode
        setEditMode(true, newBlockId.toString());

        // Center the view on the node and offset to make room for sidebar
        setViewport(
          {
            x: -(node.position.x - window.innerWidth / 2 + 400),
            y: -(node.position.y - window.innerHeight / 2 + 200),
            zoom: 1,
          },
          { duration: 800 }
        );

        // Clear the newBlockId after handling it
        clearNewBlockId();
      }
    }
  }, [newBlockId, nodes, setEditMode, setViewport, clearNewBlockId]);

  // Effect to sync individual stroke line visibilities with global setting
  useEffect(() => {
    if (paths.length > 0) {
      // Update all stroke line visibilities based on global setting
      const blockIds = new Set<number>();
      paths.forEach((path) => {
        path.blocks.forEach((block) => {
          blockIds.add(block.id);
        });
      });

      blockIds.forEach((blockId) => {
        updateStrokeLineVisibility(blockId, allStrokeLinesVisible);
      });
    }
  }, [allStrokeLinesVisible, paths, updateStrokeLineVisibility]);

  return (
    <div
      className={`flex-1 w-full h-full relative ${
        isEditMode || isConnectMode ? '' : ''
      }`}
      style={{
        backgroundColor:
          isEditMode || isConnectMode
            ? colors['bg-primary-solid']
            : colors['bg-primary'],
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={allEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        translateExtent={translateExtent}
        onNodeClick={(event, node) => {
          event.preventDefault();
          event.stopPropagation();
          // Extract the block ID from the node ID (remove "block-" prefix)
          const blockId = node.id.replace('block-', '');
          // Set edit mode to true and update the selected node ID
          setEditMode(true, blockId);

          // Don't set ReactFlow selection state as CustomNode handles this differently

          // Find the node and zoom to it
          setViewport(
            {
              x: -(node.position.x - window.innerWidth / 2 + 400),
              y: -(node.position.y - window.innerHeight / 2 + 200),
              zoom: 1,
            },
            { duration: 800 }
          );
        }}
        onPaneClick={() => {
          // Only clear edit mode, don't touch ReactFlow selection state
          setEditMode(false, null);
        }}
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
          nodes: linkNode ? [linkNode] : nodes,
          padding: 0.5,
          duration: 200,
          minZoom: 0.5,
          maxZoom: 1,
          includeHiddenNodes: true,
        }}
        className={`transition-all duration-300 ${
          isConnectMode ? 'connect-mode' : ''
        }`}
        style={{
          backgroundColor: colors['bg-secondary'],
        }}
      >
        <Background gap={20} size={3} color={colors['border-primary']} />
        <MiniMap
          nodeColor={colors['fg-brand-primary']}
          maskColor={`${colors['bg-primary']}80`}
        />
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

      <Sidebar workspaceId={workspaceId} workflowId={workflowId} />

      <div className="absolute top-4 right-4 z-10">
        <ZoomBar />
      </div>
    </div>
  );
}
