'use client'; // Add this line to mark the component as a Client Component

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
  level: number = 0,
  xOffset: number = 0
): any[] => {
  const nodes: any[] = [];
  const nodeSpacing = 150; // Vertical distance between nodes
  const horizontalSpacing = 200; // Horizontal distance between nodes
  let nodeId = 1;

  const addNode = (
    block: Block,
    parentId: string,
    level: number,
    sublevel: number,
    xOffset: number
  ) => {
    const node = {
      id: `${parentId}-${nodeId}`,
      type: 'default',
      data: { label: block.name },
      position: { x: xOffset, y: level * nodeSpacing },
      draggable: true, // Ensure the node is draggable
    };
    nodes.push(node);
    nodeId++;
  };

  blocks.forEach((block, index) => {
    // Add the parent node
    addNode(block, parentId, index, 0, xOffset);
    block.subpaths.forEach((subpath, subpathIndex) => {
      // For each subpath, calculate its sublevel and position it below the parent node
      const newXOffset = xOffset + subpathIndex * horizontalSpacing;
      subpath.forEach((subBlock, subBlockIndex) => {
        // Add subpath node with sublevel based on its index
        addNode(subBlock, parentId, index + 1, subBlockIndex, newXOffset);
      });
    });
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

    // Generate edges between nodes (for simplicity, we can assume a direct connection between parent and child)
    const edges = nodes
      .map((node, index) => {
        if (index === 0) return null; // Skip first node as it has no parent
        return {
          id: `e${index - 1}-${index}`,
          source: `${index - 1}`,
          target: `${index}`,
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
