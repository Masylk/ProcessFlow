'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

import '@xyflow/react/dist/style.css';

// Initialize ELK
const elk = new ELK();

// Define the tree data
const initialNodes: Node[] = [
  { id: '1', data: { label: 'Root' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: 'Child 1' }, position: { x: 0, y: 0 } },
  { id: '3', data: { label: 'Child 2' }, position: { x: 0, y: 0 } },
  { id: '4', data: { label: 'Grandchild 1' }, position: { x: 0, y: 0 } },
  { id: '5', data: { label: 'Grandchild 2' }, position: { x: 0, y: 0 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e2-5', source: '2', target: '5' },
];

function Flow() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const { fitView } = useReactFlow();

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

    // Configure ELK layout options
    const layoutOptions = {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80',
    };

    try {
      const layout = await elk.layout(elkGraph, {
        layoutOptions,
      });

      // Update node positions based on ELK layout
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

      // Center the view after layout is applied
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 0);
    } catch (error) {
      console.error('Error calculating layout:', error);
    }
  }, [nodes, edges, fitView]);

  // Only run layout once on mount
  useEffect(() => {
    createElkLayout();
  }, []); // Empty dependency array

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        panOnScroll
        panOnDrag
        zoomOnScroll
        selectionOnDrag={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      />
    </div>
  );
}

export default function TreeLayout() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
