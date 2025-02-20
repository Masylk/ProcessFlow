'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
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

function Flow({
  workflowName,
  blocks,
  workspaceId,
  workflowId,
}: {
  workflowName: string;
  blocks: Block[];
  workspaceId: string;
  workflowId: string;
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
            type: 'smoothstep',
            label: path.name,
            style: {
              stroke: '#666',
              strokeWidth: 2,
              strokeDasharray: '5,5',
            },
          });

          // Process blocks up to (and including) the first path block
          blocksToProcess.forEach((block, index) => {
            // Add node for current block
            newNodes.push({
              id: `block-${block.id}`,
              data: {
                label: block.step_block
                  ? block.step_block.step_data
                  : block.path_block
                    ? 'Path Block'
                    : 'Block',
              },
              position: { x: 0, y: 0 },
            });

            // Create edge to previous block in path
            if (index > 0) {
              newEdges.push({
                id: `e-path-${sortedPathBlocks[index - 1].id}-${block.id}`,
                source: `block-${sortedPathBlocks[index - 1].id}`,
                target: `block-${block.id}`,
                type: 'smoothstep',
                style: {
                  stroke: '#666',
                  strokeWidth: 2,
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
      newNodes.push({
        id: `block-${block.id}`,
        data: {
          label: block.step_block
            ? block.step_block.step_data
            : block.path_block
              ? 'Path Block'
              : 'Block',
        },
        position: { x: 0, y: 0 },
      });

      // Create edge to previous block in main flow
      if (index > 0) {
        const previousBlock = mainBlocksToProcess[index - 1];
        newEdges.push({
          id: `e-${previousBlock.id}-${block.id}`,
          source: `block-${previousBlock.id}`,
          target: `block-${block.id}`,
          type: 'smoothstep',
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

  return (
    <div className="flex flex-col h-screen">
      <div className="h-16 bg-white border-b flex items-center px-6 justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{workflowName}</h1>
        <a
          href={`/workspace/${workspaceId}/${workflowId}/edit`}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Edit Workflow
        </a>
      </div>
      <div className="flex-1">
        <div style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: false,
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
          >
            <Background gap={25} size={1} color="#f1f1f1" />
            <Controls
              showZoom={true}
              showFitView={true}
              showInteractive={true}
              fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
            />
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
