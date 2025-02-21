'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  NodeProps,
  Handle,
  Position,
  BaseEdge,
  EdgeProps,
  getBezierPath,
  SmoothStepEdge,
} from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

import '@xyflow/react/dist/style.css';

// Initialize ELK
const elk = new ELK();

interface Block {
  id: number;
  position: number;
  workflow_id: number;
  path_id: number | null;
  path_block: {
    id: number;
    paths: {
      id: number;
      name: string;
      blocks: Block[];
    }[];
  } | null;
  step_block: {
    id: number;
    step_data: string;
  } | null;
}

// Helper function to get all last blocks from nested paths with their full path info
const getLastBlocksFromPaths = (
  pathBlock: Block,
  pathHierarchy: string = ''
): Array<{ block: Block; pathHierarchy: string }> => {
  if (!pathBlock.path_block?.paths) return [];

  return pathBlock.path_block.paths.flatMap((path, pathIndex) => {
    const currentHierarchy = pathHierarchy
      ? `${pathHierarchy}-p${path.id}`
      : `p${path.id}`;
    const sortedBlocks = [...path.blocks].sort(
      (a, b) => a.position - b.position
    );
    const lastBlock = sortedBlocks[sortedBlocks.length - 1];

    if (lastBlock?.path_block?.paths) {
      return getLastBlocksFromPaths(lastBlock, currentHierarchy);
    }

    return lastBlock
      ? [{ block: lastBlock, pathHierarchy: currentHierarchy }]
      : [];
  });
};

// Update the NodeData interface
interface NodeData {
  label: string;
  position: number;
  onDelete: (id: string) => void;
}

// Update the CustomNode component
function CustomNode({ id, data, selected }: NodeProps & { data: NodeData }) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #777',
        background: selected ? '#4e6bd7' : 'white',
        color: selected ? 'white' : 'black',
        minWidth: '200px',
        minHeight: '80px',
        fontSize: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="text-base font-semibold mb-2" style={{ color: '#666' }}>
        Position: {data.position}
      </div>
      {data.label}
      <button
        onClick={(e) => {
          e.stopPropagation();
          data.onDelete(id);
        }}
        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        style={{ width: '24px', height: '24px', lineHeight: '0' }}
      >
        ×
      </button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Add this interface for edge data
interface EdgeData {
  blocks: Block[];
  handleAddBlockOnEdge: (position: number, path_id: number | null) => void;
}

// Update the EdgeProps type in CustomSmoothStepEdge
function CustomSmoothStepEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps & { data: EdgeData }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const handleEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sourceBlockId = source.replace('block-', '');
    const targetBlockId = target.replace('block-', '');

    const sourceBlock = data.blocks.find((b) => b.id === Number(sourceBlockId));
    const targetBlock = data.blocks.find((b) => b.id === Number(targetBlockId));

    if (sourceBlock && targetBlock) {
      // Get all blocks in the same path
      const pathBlocks = data.blocks.filter(
        (b) => b.path_id === sourceBlock.path_id
      );
      console.log(
        'All blocks in path:',
        pathBlocks.map((b) => ({ id: b.id, position: b.position }))
      );

      // Sort blocks by position
      const sortedBlocks = [...pathBlocks].sort(
        (a, b) => a.position - b.position
      );
      console.log(
        'Sorted blocks:',
        sortedBlocks.map((b) => ({ id: b.id, position: b.position }))
      );

      // Find the indices of source and target blocks
      const sourceIndex = sortedBlocks.findIndex(
        (b) => b.id === sourceBlock.id
      );
      const targetIndex = sortedBlocks.findIndex(
        (b) => b.id === targetBlock.id
      );
      console.log('Source block:', {
        id: sourceBlock.id,
        position: sourceBlock.position,
        index: sourceIndex,
      });
      console.log('Target block:', {
        id: targetBlock.id,
        position: targetBlock.position,
        index: targetIndex,
      });

      // Calculate new position based on surrounding blocks
      let newPosition;
      if (sourceIndex !== -1 && targetIndex !== -1) {
        if (Math.abs(sourceIndex - targetIndex) === 1) {
          newPosition = Math.ceil(
            (sourceBlock.position + targetBlock.position) / 2
          );
          console.log('Adjacent blocks - rounded up average:', newPosition);
        } else {
          const minPos = Math.min(sourceBlock.position, targetBlock.position);
          const maxPos = Math.max(sourceBlock.position, targetBlock.position);
          newPosition = Math.ceil(minPos + (maxPos - minPos) / 2);
          console.log('Non-adjacent blocks - rounded up middle position:', {
            minPos,
            maxPos,
            newPosition,
          });
        }

        data.handleAddBlockOnEdge(newPosition, sourceBlock.path_id);
      }
    }
  };

  return (
    <>
      <SmoothStepEdge
        id={id}
        source={source}
        target={target}
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
        sourcePosition={sourcePosition}
        targetPosition={targetPosition}
        style={style}
      />
      <foreignObject
        width={40}
        height={40}
        x={(sourceX + targetX) / 2 - 20}
        y={(sourceY + targetY) / 2 - 20}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex items-center justify-center w-full h-full">
          <button
            onClick={handleEdgeClick}
            className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center text-xl"
          >
            +
          </button>
        </div>
      </foreignObject>
    </>
  );
}

// Move these definitions to the top, after imports and interfaces
const nodeTypes = {
  custom: CustomNode,
} as const;

const edgeTypes = {
  smoothstepCustom: CustomSmoothStepEdge,
} as const;

function Flow({
  workflowName,
  blocks,
  workspaceId,
  workflowId,
  onBlockAdd,
  setBlocks,
}: {
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
}) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [translateExtent, setTranslateExtent] = useState<
    [[number, number], [number, number]]
  >([
    [-2000, -2000],
    [2000, 2000],
  ]);
  const { fitView } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Calculate translate extent based on node positions
  useEffect(() => {
    if (nodes.length === 0) return;

    const padding = 1000; // Extra space around nodes
    const positions = nodes.map((node) => node.position);

    const minX = Math.min(...positions.map((pos) => pos.x));
    const maxX = Math.max(...positions.map((pos) => pos.x));
    const minY = Math.min(...positions.map((pos) => pos.y));
    const maxY = Math.max(...positions.map((pos) => pos.y));

    // Calculate bounds with padding and scale based on number of nodes
    const scale = Math.max(1, Math.ceil(nodes.length / 10)); // Scale bounds based on node count
    const bounds = [
      [minX - padding * scale, minY - padding * scale],
      [maxX + padding * scale, maxY + padding * scale],
    ] as [[number, number], [number, number]];

    setTranslateExtent(bounds);
  }, [nodes]);

  // Convert blocks to nodes and edges
  useEffect(() => {
    if (!Array.isArray(blocks)) {
      console.error('Blocks is not an array:', blocks);
      return;
    }

    // Sort blocks by position to ensure correct order
    const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Helper function to process path blocks recursively
    const processPathBlock = (pathBlock: Block, parentId: string) => {
      if (!pathBlock.path_block?.paths) return;

      pathBlock.path_block.paths.forEach((path) => {
        if (path.blocks.length > 0) {
          // Sort blocks within the path
          const sortedPathBlocks = [...path.blocks].sort(
            (a, b) => a.position - b.position
          );

          // Find the first path block in this path (if any)
          const firstPathBlockIndex = sortedPathBlocks.findIndex(
            (block) => block.path_block?.paths
          );

          // If there's a path block, only process blocks up to that point
          const blocksToProcess =
            firstPathBlockIndex !== -1
              ? sortedPathBlocks.slice(0, firstPathBlockIndex + 1)
              : sortedPathBlocks;

          // Add edge from parent block to first block in path
          newEdges.push({
            id: `e-path-${parentId}-${blocksToProcess[0].id}`,
            source: parentId,
            target: `block-${blocksToProcess[0].id}`,
            type: 'smoothstepCustom',
            label: path.name,
            style: {
              stroke: '#666',
              strokeWidth: 5,
              strokeDasharray: '5,5',
            },
            data: {
              blocks,
              handleAddBlockOnEdge,
            },
          });

          // Process blocks up to (and including) the first path block
          blocksToProcess.forEach((block, index) => {
            // Add node for current block
            const node = {
              id: `block-${block.id}`,
              type: 'custom',
              position: { x: 0, y: 0 },
              data: {
                label: block.step_block
                  ? block.step_block.step_data
                  : block.path_block
                    ? 'Path Block'
                    : 'Block',
                position: block.position,
                onDelete: handleDeleteBlock,
              },
            };
            newNodes.push(node);

            // Create edge to previous block in path
            if (index > 0) {
              newEdges.push({
                id: `e-path-${sortedPathBlocks[index - 1].id}-${block.id}`,
                source: `block-${sortedPathBlocks[index - 1].id}`,
                target: `block-${block.id}`,
                type: 'smoothstepCustom',
                data: {
                  blocks,
                  handleAddBlockOnEdge,
                },
                style: {
                  stroke: '#666',
                  strokeWidth: 5,
                  strokeDasharray: '5,5',
                },
              });
            }

            // If this block is a path block, start a new layout by processing it recursively
            if (block.path_block?.paths) {
              processPathBlock(block, `block-${block.id}`);
            }
          });
        }
      });
    };

    // Process main flow blocks
    const firstPathBlockIndex = sortedBlocks.findIndex(
      (block) => block.path_block?.paths
    );

    // Only process blocks up to and including the first path block in the main flow
    const mainBlocksToProcess =
      firstPathBlockIndex !== -1
        ? sortedBlocks.slice(0, firstPathBlockIndex + 1)
        : sortedBlocks;

    mainBlocksToProcess.forEach((block, index) => {
      // Create node for the current block
      const node = {
        id: `block-${block.id}`,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: {
          label: block.step_block
            ? block.step_block.step_data
            : block.path_block
              ? 'Path Block'
              : 'Block',
          position: block.position,
          onDelete: handleDeleteBlock,
        },
      };
      newNodes.push(node);

      // Create edge to previous block in main flow
      if (index > 0) {
        const previousBlock = mainBlocksToProcess[index - 1];
        newEdges.push({
          id: `e-${previousBlock.id}-${block.id}`,
          source: `block-${previousBlock.id}`,
          target: `block-${block.id}`,
          type: 'smoothstepCustom',
          data: {
            blocks,
            handleAddBlockOnEdge,
          },
          style: { strokeWidth: 5 },
        });
      }

      // If it's a path block, start a new layout
      if (block.path_block?.paths) {
        processPathBlock(block, `block-${block.id}`);
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [blocks]);

  const createElkLayout = useCallback(async () => {
    // First, create a Set of all node IDs for quick lookup
    const nodeIds = new Set(nodes.map((node) => node.id));

    // Filter edges to only include those where both source and target nodes exist
    const validEdges = edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
    );

    const elkNodes = nodes.map((node) => ({
      id: node.id,
      width: 200,
      height: 60,
      padding: [20, 20, 20, 20],
    }));

    const elkEdges = validEdges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    }));

    const elkGraph = {
      id: 'root',
      children: elkNodes,
      edges: elkEdges,
    };

    const layoutOptions = {
      'elk.algorithm': 'mrtree',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '200',
      'elk.spacing.componentComponent': '200',
      'elk.nodeSize.constraints': 'MINIMUM_SIZE',
      'elk.nodeSize.minimum': '150',
      'elk.spacing.nodeNodeBetweenLayers': '150',
      'elk.layered.mergeEdges': 'false',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.aspectRatio': '2.0',
      'elk.padding': '[top=100,left=100,bottom=100,right=100]',
      'elk.interactive': 'true',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.spacing.individual': '50',
      'elk.spacing.base': '100',
    };

    // Add error handling around the layout calculation
    try {
      const layout = await elk.layout(elkGraph, {
        layoutOptions,
      });

      if (!layout || !layout.children) {
        console.error('Invalid layout result:', layout);
        return;
      }

      const newNodes = nodes.map((node) => {
        const elkNode = layout.children?.find((n) => n.id === node.id);
        if (elkNode) {
          return {
            ...node,
            position: {
              x: elkNode.x || 0,
              y: elkNode.y || 0,
            },
          };
        }
        return node;
      });

      setNodes(newNodes);

      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 0);
    } catch (error) {
      console.error('Error calculating layout:', error);
    }
  }, [nodes, edges, fitView]);

  useEffect(() => {
    if (nodes.length > 0) {
      createElkLayout();
    }
  }, [nodes.length]);

  const handleAddBlockOnEdge = useCallback(
    async (position: number, path_id: number | null = null) => {
      const defaultBlock = {
        type: 'STEP',
        position: position,
        icon: '/step-icons/default-icons/container.svg',
        description: 'This is a default block',
        workflow_id: Number(workflowId),
        path_id: path_id,
        step_block: {
          step_details: 'Default step details',
        },
      };

      await onBlockAdd(defaultBlock, defaultBlock.path_id!, position);
    },
    [workflowId, onBlockAdd]
  );

  // Add onNodeClick handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // Add onPaneClick handler to deselect when clicking empty space
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Add this handler near your other event handlers
  const onNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log('Hovering node:', node);
    },
    []
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[] }) => {
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: selectedNodes.some((n: Node) => n.id === node.id),
        }))
      );
    },
    []
  );

  // Add this handler near your other event handlers
  const onEdgeMouseEnter = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      console.log('Hovering edge:', edge);
    },
    []
  );

  // Add this handler near your other handlers
  const handleAddStartBlock = useCallback(async () => {
    const defaultBlock = {
      type: 'STEP',
      position: 0, // Position 0 to add at start
      icon: '/step-icons/default-icons/container.svg',
      description: 'This is a start block',
      workflow_id: Number(workflowId),
      path_id: blocks[0]?.path_id || null,
      step_block: {
        step_details: 'Start step details',
      },
    };

    await onBlockAdd(defaultBlock, defaultBlock.path_id!, 0);
  }, [blocks, workflowId, onBlockAdd]);

  // Add handleDeleteBlock to the Flow component
  const handleDeleteBlock = useCallback(
    async (nodeId: string) => {
      const blockId = nodeId.replace('block-', '');
      try {
        const response = await fetch(`/api/blocks/${blockId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Get fresh data
          const pathsResponse = await fetch(
            `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
          );
          if (pathsResponse.ok) {
            const pathsData = await pathsResponse.json();
            if (pathsData.paths?.[0]?.blocks) {
              // Reset everything and rebuild from scratch
              setNodes([]);
              setEdges([]);
              setBlocks(pathsData.paths[0].blocks);
            }
          }
        } else {
          console.error('Failed to delete block');
        }
      } catch (error) {
        console.error('Error deleting block:', error);
      }
    },
    [workspaceId, workflowId, setBlocks]
  );

  return (
    <div className="flex flex-col h-screen">
      <div className="h-16 bg-white border-b flex items-center px-6 justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{workflowName}</h1>
        <div className="flex gap-4">
          <button
            onClick={handleAddStartBlock}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add Start Block
          </button>
          <a
            href={`/workspace/${workspaceId}/${workflowId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Workflow
          </a>
        </div>
      </div>
      <div className="flex-1">
        <div style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodeMouseEnter={onNodeMouseEnter}
            onEdgeMouseEnter={onEdgeMouseEnter}
            defaultEdgeOptions={{
              type: 'smoothstepCustom',
              animated: false,
              style: { strokeWidth: 5 },
            }}
            minZoom={0.1}
            maxZoom={4}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomActivationKeyCode={null}
            zoomOnDoubleClick={true}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            translateExtent={translateExtent}
            preventScrolling={false}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            draggable={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            selectNodesOnDrag={false}
          >
            <Background gap={25} size={1} color="#f1f1f1" />
            <Controls />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

function ReactFlowPageClient({
  workspaceId,
  workflowId,
}: {
  workspaceId: string;
  workflowId: string;
}) {
  const [workflowName, setWorkflowName] = useState<string>('');
  const [blocks, setBlocks] = useState<Block[]>([]);

  const handleBlockAdd = async (
    blockData: any,
    path_id: number,
    position: number
  ) => {
    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blockData),
      });

      if (response.ok) {
        // Refresh blocks after adding new one
        const pathsResponse = await fetch(
          `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
        );
        if (pathsResponse.ok) {
          const pathsData = await pathsResponse.json();
          if (pathsData.paths?.[0]?.blocks) {
            setBlocks(pathsData.paths[0].blocks);
          }
        }
      }
    } catch (error) {
      console.error('Error adding block:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workflow details
        const workflowResponse = await fetch(
          `/api/workspace/${workspaceId}/workflows/${workflowId}`
        );
        if (!workflowResponse.ok) {
          throw new Error('Failed to fetch workflow');
        }
        const workflow = await workflowResponse.json();
        setWorkflowName(workflow.name);

        // Fetch paths and blocks
        const pathsResponse = await fetch(
          `/api/workspace/${workspaceId}/paths?workflow_id=${workflowId}`
        );
        if (!pathsResponse.ok) {
          throw new Error('Failed to fetch paths');
        }
        const pathsData = await pathsResponse.json();

        if (
          pathsData.paths &&
          pathsData.paths[0] &&
          pathsData.paths[0].blocks
        ) {
          setBlocks(pathsData.paths[0].blocks);
        } else {
          console.error('No blocks found in path data');
          setBlocks([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setBlocks([]);
      }
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

export default function ReactFlowPage({
  params,
}: {
  params: Promise<{ id: string; workflowId: string }>;
}) {
  const resolvedParams = React.use(params);

  return (
    <ReactFlowPageClient
      workspaceId={resolvedParams.id}
      workflowId={resolvedParams.workflowId}
    />
  );
}
