'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Background,
  Connection,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Add this interface at the top
interface NodeData {
  label: string;
}

// Custom node component
function CustomNode({ data, selected }: NodeProps & { data: NodeData }) {
  return (
    <div
      style={{
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #777',
        background: selected ? '#4e6bd7' : 'white',
        color: selected ? 'white' : 'black',
      }}
    >
      <Handle type="target" position={Position.Top} />
      {data.label}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

// Node types object
const nodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Start Node' },
    type: 'custom',
  },
  {
    id: '2',
    position: { x: 300, y: 200 },
    data: { label: 'Middle Node' },
    type: 'custom',
  },
  {
    id: '3',
    position: { x: 500, y: 300 },
    data: { label: 'End Node' },
    type: 'custom',
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

function Flow() {
  const [nodes, setNodes] = React.useState<Node[]>(initialNodes);
  const [edges, setEdges] = React.useState<Edge[]>(initialEdges);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, []);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      return changes.reduce(
        (acc: Node[], change: any) => {
          if (change.type === 'position' && change.dragging) {
            const node = acc.find((n) => n.id === change.id);
            if (node) {
              node.position = {
                x: change.position.x,
                y: change.position.y,
              };
            }
          }
          return acc;
        },
        [...nds]
      );
    });
  }, []);

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

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        draggable={false}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

export default function ReactFlowTestPage() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
