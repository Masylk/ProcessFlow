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

    sortedBlocks.forEach((block) => {
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
        position: { x: 0, y: 0 }, // Initial position, will be set by ELK
      });

      // Create edge to previous block (if not the first block)
      if (block.position > 0) {
        const previousBlock = sortedBlocks[block.position - 1];
        // Only create edge if neither the current block's previous block is a path block
        if (previousBlock && !previousBlock.path_block) {
          newEdges.push({
            id: `e-${previousBlock.id}-${block.id}`,
            source: `block-${previousBlock.id}`,
            target: `block-${block.id}`,
          });
        }
      }

      // If it's a path block, add nodes and edges for its paths
      if (block.path_block?.paths) {
        block.path_block.paths.forEach((path) => {
          if (path.blocks.length > 0) {
            // Update edge type to smoothstep
            newEdges.push({
              id: `e-path-${block.id}-${path.blocks[0].id}`,
              source: `block-${block.id}`,
              target: `block-${path.blocks[0].id}`,
              type: 'smoothstep',
              label: path.name,
              style: {
                stroke: '#666',
                strokeWidth: 2,
                strokeDasharray: '5,5',
              },
            });

            // Connect blocks within the path and handle nested paths
            path.blocks.forEach((pathBlock, index) => {
              // Create node for the path block
              newNodes.push({
                id: `block-${pathBlock.id}`,
                data: {
                  label: pathBlock.step_block
                    ? pathBlock.step_block.step_data
                    : pathBlock.path_block
                      ? 'Path Block'
                      : 'Block',
                },
                position: { x: 0, y: 0 },
              });

              // Create edge to previous block in path
              if (index > 0) {
                const previousPathBlock = path.blocks[index - 1];
                // Only create edge if previous block is not a path block
                if (!previousPathBlock.path_block) {
                  newEdges.push({
                    id: `e-path-${previousPathBlock.id}-${pathBlock.id}`,
                    source: `block-${previousPathBlock.id}`,
                    target: `block-${pathBlock.id}`,
                    type: 'smoothstep',
                    style: {
                      stroke: '#666',
                      strokeWidth: 2,
                      strokeDasharray: '5,5',
                    },
                  });
                }
              }

              // If this block is a path block, recursively handle its paths
              if (pathBlock.path_block?.paths) {
                pathBlock.path_block.paths.forEach((nestedPath) => {
                  if (nestedPath.blocks.length > 0) {
                    const sortedNestedBlocks = [...nestedPath.blocks].sort(
                      (a, b) => a.position - b.position
                    );

                    // Connect path block to first block in nested path
                    newEdges.push({
                      id: `e-nested-path-${pathBlock.id}-${sortedNestedBlocks[0].id}`,
                      source: `block-${pathBlock.id}`,
                      target: `block-${sortedNestedBlocks[0].id}`,
                      label: nestedPath.name,
                      type: 'smoothstep',
                      style: {
                        stroke: '#666',
                        strokeWidth: 2,
                        strokeDasharray: '5,5',
                      },
                    });

                    // Add nodes and edges for nested path blocks
                    sortedNestedBlocks.forEach((nestedBlock, nestedIndex) => {
                      newNodes.push({
                        id: `block-${nestedBlock.id}`,
                        data: {
                          label: nestedBlock.step_block
                            ? nestedBlock.step_block.step_data
                            : nestedBlock.path_block
                              ? 'Path Block'
                              : 'Block',
                        },
                        position: { x: 0, y: 0 },
                      });

                      if (nestedIndex > 0) {
                        newEdges.push({
                          id: `e-nested-${sortedNestedBlocks[nestedIndex - 1].id}-${nestedBlock.id}`,
                          source: `block-${sortedNestedBlocks[nestedIndex - 1].id}`,
                          target: `block-${nestedBlock.id}`,
                          type: 'smoothstep',
                          style: {
                            stroke: '#666',
                            strokeWidth: 2,
                            strokeDasharray: '5,5',
                          },
                        });
                      }
                    });

                    // Connect last block in nested path back to the next block in parent path
                    if (index < path.blocks.length - 1) {
                      const nextParentBlock = path.blocks[index + 1];
                      const lastNestedBlock =
                        sortedNestedBlocks[sortedNestedBlocks.length - 1];
                      newEdges.push({
                        id: `e-nested-return-${lastNestedBlock.id}-${nextParentBlock.id}`,
                        source: `block-${lastNestedBlock.id}`,
                        target: `block-${nextParentBlock.id}`,
                        type: 'smoothstep',
                        style: {
                          stroke: '#666',
                          strokeWidth: 2,
                          strokeDasharray: '5,5',
                        },
                      });
                    }
                  }
                });
              }
            });

            // Connect last block in path back to the next main block if it exists
            if (block.position < sortedBlocks.length - 1) {
              const nextMainBlock = sortedBlocks[block.position + 1];

              if (block.path_block?.paths) {
                const lastBlocks = getLastBlocksFromPaths(block);

                lastBlocks.forEach(({ block: lastBlock, pathHierarchy }) => {
                  newEdges.push({
                    id: `e-path-return-${lastBlock.id}-${nextMainBlock.id}-${pathHierarchy}`,
                    source: `block-${lastBlock.id}`,
                    target: `block-${nextMainBlock.id}`,
                    type: 'smoothstep',
                    style: {
                      stroke: '#666',
                      strokeWidth: 2,
                      strokeDasharray: '5,5',
                    },
                  });
                });
              }
            }
          }
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [blocks]);

  const createElkLayout = useCallback(async () => {
    const elkNodes = nodes.map((node) => ({
      id: node.id,
      width: 150,
      height: 50,
    }));

    const elkEdges = edges.map((edge) => ({
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
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '150',
      'elk.layered.spacing.nodeNodeBetweenLayers': '150',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'LINEAR_SEGMENTS',
      'elk.layered.nodePlacement.favorStraightEdges': 'true',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.layering.nodePromotion': 'true',
      'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
      'elk.layered.cycleBreaking.strategy': 'DEPTH_FIRST',
      'elk.spacing.componentComponent': '150',
      'elk.layered.mergeEdges': 'false',
      'elk.layered.spacing.edgeNodeBetweenLayers': '150',
      'elk.layered.priority.direction': '1',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.layered.layering.minWidth': '2',
      'elk.layered.crossingMinimization.semiInteractive': 'true',
      'elk.layered.layering.layerConstraint': 'SAME_LAYER',
      'elk.layered.layering.layerChoiceConstraint': 'FIRST',
      'elk.layered.nodePlacement.bk.fixedAlignment': 'true',
      'elk.layered.nodePlacement.bk.alignmentMode': 'BALANCED',
    };

    try {
      const layout = await elk.layout(elkGraph, {
        layoutOptions,
      });

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
