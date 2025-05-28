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
import CustomBlock from './blocks/CustomBlock';
import CustomSmoothStepEdge from './edges/CustomSmoothStepEdge';
import AddBlockDropdownMenu from './AddBlockDropdownMenu';
import {
  NodeData,
  EdgeData,
  DropdownDatas,
  Path,
  Block,
  DelayType,
  StrokeLine,
} from '../../types';
import path from 'path';
import { processPath } from '../utils/processPath';
import BeginBlock from './blocks/BeginBlock';
import EndBlock from './blocks/EndBlock';
import SmoothStepCustomParent from './edges/SmoothStepCustomParent';
import { BlockEndType } from '@/types/block';
import LastBlock from './blocks/LastBlock';
import PathBlock from './blocks/PathBlock';
import { useModalStore } from '../store/modalStore';
import CreateParallelPathModal from './modals/CreateParallelPathModal';
import { createParallelPaths } from '../utils/createParallelPaths';
import StrokeEdge from './edges/StrokeEdge';
import ConnectNodeModal from './modals/ConnectNodeModal';
import { useConnectModeStore } from '../store/connectModeStore';
import { PathSelectionBox } from './PathSelectionBox';
import MergeBlock from './blocks/MergeBlock';
import { usePathsStore } from '../store/pathsStore';
import { UpdatePathSelectionBox } from './UpdatePathSelectionBox';
import InvisibleBlock from './blocks/InvisibleBlock';
import { useEditModeStore } from '../store/editModeStore';
import { useSearchParams } from 'next/navigation';
import ZoomBar from './ZoomBar';
import { Sidebar } from './Sidebar';
import { useColors } from '@/app/theme/hooks';
import FixedDelayBlock from './blocks/FixedDelayBlock';
import EventDelayBlock from './blocks/EventDelayBlock';
import { useStrokeLinesStore } from '../store/strokeLinesStore';
import { useIsModalOpenStore } from '@/app/isModalOpenStore';
import { useLoadingStore } from '../store/loadingStore';
import EditLinksModal from './modals/EditLinksModal';
import { debounce } from '../utils/debounce';

type StrokeLineVisibility = [number, boolean];

const nodeTypes = {
  custom: CustomBlock,
  begin: BeginBlock,
  end: EndBlock,
  last: LastBlock,
  path: PathBlock,
  merge: MergeBlock,
  invisible: InvisibleBlock,
  fixedDelay: FixedDelayBlock,
  eventDelay: EventDelayBlock,
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
  strokeLines: StrokeLine[];
  setStrokeLines: React.Dispatch<React.SetStateAction<StrokeLine[]>>;
  newBlockId: number | null;
  clearNewBlockId: () => void;
}

export const Flow = React.memo(function Flow({
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
  // Reset paths store on mount and unmount
  useEffect(() => {
    setPaths([]);
    return () => {
      setPaths([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  const { allStrokeLinesVisible, setAllStrokeLinesVisible } =
    useStrokeLinesStore();
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
  const isModalOpen = useIsModalOpenStore((state: any) => state.isModalOpen);
  const setIsModalOpen = useIsModalOpenStore(
    (state: any) => state.setIsModalOpen
  );
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

      // Optimistically update UI
      setPaths((currentPaths) => {
        // Find the path and the deleted block's position
        let deletedBlockPosition: number | null = null;
        let deletedBlockPathId: number | null = null;

        currentPaths.forEach((path) => {
          const found = path.blocks.find(
            (block) => block.id === parseInt(blockId)
          );
          if (found) {
            deletedBlockPosition = found.position;
            deletedBlockPathId = path.id;
          }
        });

        if (deletedBlockPosition === null || deletedBlockPathId === null) {
          // Block not found, just filter as before
          return currentPaths.map((path) => ({
            ...path,
            blocks: path.blocks.filter(
              (block) => block.id !== parseInt(blockId)
            ),
          }));
        }

        // Update the path: remove the block, and decrement positions
        return currentPaths.map((path) => {
          if (path.id !== deletedBlockPathId) {
            return {
              ...path,
              blocks: path.blocks,
            };
          }
          const filteredBlocks = path.blocks
            .filter((block) => block.id !== parseInt(blockId))
            .map((block) => {
              if (block.position > deletedBlockPosition!) {
                return { ...block, position: block.position - 1 };
              }
              return block;
            });
          return {
            ...path,
            blocks: filteredBlocks,
          };
        });
      });

      // Save previous state for rollback
      const previousPaths = usePathsStore.getState().paths;

      try {
        const response = await fetch(`/api/blocks/${blockId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          // Rollback on error
          setPaths(previousPaths);
          throw new Error('Failed to delete block');
        }
      } catch (error) {
        // Rollback on error
        setPaths(previousPaths);
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

  // Add state for ConnectNodeModal at the top of Flow
  const [showConnectNodeModal, setShowConnectNodeModal] = useState(false);
  const [connectModalSourceNode, setConnectModalSourceNode] =
    useState<Node | null>(null);
  const [connectModalTargetNode, setConnectModalTargetNode] =
    useState<Node | null>(null);
  const [connectModalLabel, setConnectModalLabel] = useState<string>('');
  const { setShowEditLinksModal } = useModalStore();
  const showEditLinksModal = useModalStore((state) => state.showEditLinksModal);
  const [editStrokeLineId, setEditStrokeLineId] = useState<string | undefined>(
    undefined
  );
  const [isEditLink, setIsEditLink] = useState(false);

  // Add a callback to update a stroke line in state
  const handleLinkUpdated = useCallback(
    (updatedStrokeLine: StrokeLine) => {
      setStrokeLines((prev) =>
        prev.map((line) =>
          line.id === updatedStrokeLine.id
            ? { ...line, ...updatedStrokeLine }
            : line
        )
      );
    },
    [setStrokeLines]
  );

  // Main effect for creating nodes and edges
  useEffect(() => {
    if (!Array.isArray(paths)) return;

    const createLayoutedNodes = async () => {
      try {
        // Find ALL paths with no parent blocks (root paths) instead of just the first one
        const rootPaths = paths.filter((path) => path.parent_blocks?.length === 0);
        
        if (rootPaths.length > 0) {
          const nodes: Node[] = [];
          const edges: Edge[] = [];

          // Process each root path to ensure all workflow nodes are created
          rootPaths.forEach((rootPath) => {
            processPath(
              workspaceId,
              rootPath,
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
          });

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
                onPathsUpdate: setPaths,
                strokeLines: strokeLines,
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
          const blockId = searchParams ? searchParams.get('blockId') : null;
          if (blockId) {
            const targetNode = layoutedNodes.find(
              (n) => n.id === `block-${blockId}`
            );
            if (targetNode) {
              setDefaultViewport({
                x: -(targetNode.position.x - window.innerWidth / 2),
                y: -(targetNode.position.y - window.innerHeight / 2),
                zoom: 1,
              });
              setLinkNode(targetNode);
            }
          }
        }
      } catch (error) {
        console.error('Error creating layout:', error);
        // Provide fallback - set empty nodes/edges to prevent crashes
        setNodes([]);
        setEdges([]);
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
      // Validate delay options if it's a DELAY block
      if (blockType === 'DELAY') {
        if (!delayOptions?.delayType) {
          throw new Error('Delay type is required for DELAY blocks');
        }
        if (
          delayOptions.delayType === DelayType.FIXED_DURATION &&
          (typeof delayOptions.seconds !== 'number' || delayOptions.seconds < 0)
        ) {
          throw new Error(
            'A valid delay value (non-negative number) is required for fixed duration delays'
          );
        }
        if (
          delayOptions.delayType === DelayType.WAIT_FOR_EVENT &&
          !delayOptions.eventName
        ) {
          throw new Error('Event name is required for event-based delays');
        }
        // For event-based delays, seconds is optional but must be non-negative if provided
        if (
          delayOptions.delayType === DelayType.WAIT_FOR_EVENT &&
          delayOptions.seconds !== undefined &&
          delayOptions.seconds < 0
        ) {
          throw new Error('If provided, expiration time must be non-negative');
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

      await onBlockAdd(
        blockData,
        dropdownDatas.path.id,
        dropdownDatas.position
      );
      setShowDropdown(false);
    } catch (error) {
      console.error('Error creating block:', error);
      setShowDropdown(false);
      // Optionally show user-friendly error message
      // You could add a toast notification here
    }
  };

  const showParallelPathModal = useModalStore(
    (state) => state.showParallelPathModal
  );
  const modalData = useModalStore((state) => state.modalData);
  const setShowModal = useModalStore((state) => state.setShowModal);

  const handleCreateParallelPaths = async (data: {
    conditionName: string;
    conditionDescription?: string;
    icon?: string;
    paths_to_create: string[];
    path_to_move: number;
  }) => {
    try {
      setShowModal(false);
      if (modalData.path) {
        // Create parallel paths using the modal data
        setIsModalOpen(true);
        const creationData: {
          updatedPaths: Path[];
          rollbackPaths: Path[];
        } = await createParallelPaths(
          paths,
          modalData.path,
          modalData.position,
          {
            paths_to_create: data.paths_to_create,
            path_to_move: data.path_to_move,
            pathblock_title: data.conditionName,
            pathblock_description: data.conditionDescription,
            pathblock_icon: data.icon,
          },
          setPaths
        );
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating parallel paths:', error);
      setIsModalOpen(false);
      // Optionally show user-friendly error message
      // You could add a toast notification here
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
  }, [
    paths,
    allStrokeLinesVisible,
    updateStrokeLineVisibility,
    setAllStrokeLinesVisible,
  ]);

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
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create connection');
        }

        // Close modal
        setShowConnectModal(false);

        // Fetch updated stroke lines
        const strokeLinesResponse = await fetch(
          `/api/stroke-lines?workflow_id=${parseInt(workflowId)}`
        );
        if (!strokeLinesResponse.ok) {
          throw new Error('Failed to fetch updated connections');
        }
        const strokeLines = await strokeLinesResponse.json();
        setStrokeLines(strokeLines);
      } catch (error) {
        console.error('Error in handleConnect:', error);
        // Re-throw the error to be handled by the modal
        throw error;
      }
    },
    [nodes, connectData, setShowConnectModal, setStrokeLines, workflowId]
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

  // Create a debounced version of setPaths
  const debouncedSetPaths = useCallback(
    debounce((newPaths: Path[]) => {
      setPaths(newPaths);
    }, 100),
    [setPaths]
  );

  useEffect(() => {
    const handlePathsUpdate = (event: CustomEvent) => {
      debouncedSetPaths(event.detail);
    };

    window.addEventListener('updatePaths', handlePathsUpdate as EventListener);

    return () => {
      window.removeEventListener(
        'updatePaths',
        handlePathsUpdate as EventListener
      );
    };
  }, [debouncedSetPaths]);

  useEffect(() => {
    setAllPaths(paths);
  }, [paths, setAllPaths]);

  useEffect(() => {
    if (newBlockId && nodes.length > 0) {
      // Find the node with the new block ID
      const nodeId = `block-${newBlockId}`;
      const node = nodes.find((n) => n.id === nodeId);

      const newblock: Block | undefined = paths
        .flatMap((p) => p.blocks)
        .find((b) => b.id === newBlockId);
      if (!newblock || newblock.type !== 'STEP') return;

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

  // Set the modal store's onStrokeLinesUpdate to setStrokeLines
  useEffect(() => {
    useModalStore.getState().setOnStrokeLinesUpdate(setStrokeLines);
    // Optionally, clean up on unmount
    return () => {
      useModalStore.getState().setOnStrokeLinesUpdate(undefined);
    };
  }, [setStrokeLines]);

  return (
    <div
      className={`fixed inset-0 flex-1 w-full h-screen overflow-hidden ${
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
          if (isModalOpen) return;
          event.preventDefault();
          event.stopPropagation();
          if (node.data.type !== 'STEP') return;
          const blockId = node.id.replace('block-', '');
          setEditMode(true, blockId);

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
        preventScrolling={true}
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
        className={`w-full h-full ${isConnectMode ? 'connect-mode' : ''}`}
        style={{
          backgroundColor: colors['bg-secondary'],
        }}
      >
        <Background gap={20} size={3} color={colors['border-primary']} />
        <MiniMap
          nodeColor={colors['fg-brand-primary']}
          maskColor={`${colors['bg-primary']}20`}
          className="custom-minimap"
          style={{ 
            bottom: 90,
            borderRadius: '8px',
            border: `1px solid ${colors['border-secondary']}`,
          }}
          nodeStrokeColor={colors['border-primary']}
          nodeStrokeWidth={2}
          nodeBorderRadius={4}
          pannable={true}
          zoomable={true}
        />
      </ReactFlow>
      <PathSelectionBox workspaceId={workspaceId} workflowId={workflowId} />
      <UpdatePathSelectionBox
        workspaceId={workspaceId}
        workflowId={workflowId}
      />
      {showDropdown && dropdownDatas && (
        <AddBlockDropdownMenu
          dropdownDatas={dropdownDatas}
          onSelect={handleBlockTypeSelect}
          onClose={() => {
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

      {showConnectNodeModal &&
        connectModalSourceNode &&
        connectModalTargetNode && (
          <ConnectNodeModal
            onClose={() => setShowConnectNodeModal(false)}
            onConfirm={() => setShowConnectNodeModal(false)}
            sourceNode={connectModalSourceNode}
            availableNodes={getNodes()}
            initialTargetNodeId={connectModalTargetNode.id}
            initialLabel={connectModalLabel}
            editStrokeLineId={editStrokeLineId}
            isEdit={isEditLink}
            onLinkUpdated={handleLinkUpdated}
          />
        )}

      <EditLinksModal
        onEditLink={(sourceNode, targetNode, label, strokeLineId) => {
          setConnectModalSourceNode(sourceNode);
          setConnectModalTargetNode(targetNode);
          setConnectModalLabel(label);
          setEditStrokeLineId(strokeLineId);
          setIsEditLink(true);
          setShowConnectNodeModal(true);
          setShowEditLinksModal(false);
        }}
      />

      <Sidebar workspaceId={workspaceId} workflowId={workflowId} />

      <div className="absolute top-20 right-8 z-10">
        <ZoomBar />
      </div>
    </div>
  );
});
