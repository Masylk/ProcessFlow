'use client'; // Mark the component as a Client Component

import React, { useEffect, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
} from 'react-flow-renderer';

// Define the Block interface
interface Block {
  name: string;
  description: string;
  subpaths: Block[][];
}

// Constants for positioning
const NODE_SPACING = 20; // Vertical and horizontal spacing between nodes
const BLOCK_HEIGHT = 50; // Height of each block
const BLOCK_WIDTH = 100; // Width of each block

// Function to generate a list of blocks with 2 subpaths each
const generateBlocks = (): Block[] => {
  const blocks: Block[] = [];

  for (let i = 1; i <= 5; i++) {
    const block: Block = {
      name: `Block ${i}`,
      description: `Description for Block ${i}`,
      subpaths: [
        [
          {
            name: `Block ${i}-Subpath 1-1`,
            description: `Description for Block ${i}-Subpath 1-1`,
            subpaths: [],
          },
          {
            name: `Block ${i}-Subpath 1-2`,
            description: `Description for Block ${i}-Subpath 1-2`,
            subpaths: [],
          },
        ],
        [
          {
            name: `Block ${i}-Subpath 2-1`,
            description: `Description for Block ${i}-Subpath 2-1`,
            subpaths: [],
          },
          {
            name: `Block ${i}-Subpath 2-2`,
            description: `Description for Block ${i}-Subpath 2-2`,
            subpaths: [],
          },
        ],
      ],
    };

    blocks.push(block);
  }

  return blocks;
};

// Function to convert Block list to ReactFlow nodes
const convertBlocksToNodes = (
  blocks: Block[],
  parentId: string = '',
  stage: number = 0,
  xOffset: number = 0
): any[] => {
  const nodes: any[] = [];
  let nodeId = 1;

  const addNode = (
    block: Block,
    parentId: string,
    stage: number,
    positionIndex: number,
    totalNodes: number
  ) => {
    // Calculate x position for the node
    const totalLineLength = totalNodes * (BLOCK_WIDTH + NODE_SPACING);
    const maxLeft = -totalLineLength / 2;
    const x = maxLeft + positionIndex * (totalLineLength / totalNodes);

    // Calculate y position for the node
    const y = stage * (BLOCK_HEIGHT + NODE_SPACING);

    const node = {
      id: `${parentId}-${nodeId}`,
      type: 'default',
      data: { label: block.name },
      position: { x, y },
      draggable: true, // Ensure the node is draggable
    };
    nodes.push(node);
    nodeId++;
  };

  blocks.forEach((block, index) => {
    // Add the parent node
    addNode(block, parentId, stage, index, blocks.length);

    // Recursively add subpaths
    block.subpaths.forEach((subpath, subpathIndex) => {
      subpath.forEach((subBlock, subBlockIndex) => {
        addNode(
          subBlock,
          parentId,
          stage + 1,
          subpathIndex * subpath.length + subBlockIndex,
          subpath.length * block.subpaths.length
        );
      });
      stage += 1;
    });
    stage += 1;
  });

  return nodes;
};

const ReactFlowExample: React.FC = () => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    const blocks = generateBlocks();

    // Convert blocks to ReactFlow nodes
    const nodes = convertBlocksToNodes(blocks);

    // Generate edges between nodes (for simplicity, assume direct connections)
    const edges = nodes
      .map((node, index) => {
        if (index === 0) return null; // Skip first node as it has no parent
        return {
          id: `e${index - 1}-${index}`,
          source: `${nodes[index - 1].id}`,
          target: `${node.id}`,
        };
      })
      .filter(Boolean);

    setNodes(nodes);
    setEdges(edges);
  }, []);

  const onNodeDragStop = (event: any, node: any) => {
    // Update the position of the dragged node in the state
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      )
    );
  };

  return (
    <div style={{ height: '100vh' }}>
      <div style={{ height: '90%' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeDragStop={onNodeDragStop} // Handle node drag stop event
            fitView
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default ReactFlowExample;
