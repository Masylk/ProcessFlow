'use client';

import React from 'react';
import { MiniMap, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodes = [
  { id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: 'A' } },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'B' },
  },
];

export default function MiniMapTest() {
  return (
    <div style={{ width: 600, height: 400 }}>
      <ReactFlow nodes={nodes} edges={[]} fitView>
        <MiniMap nodeColor="#000" />
      </ReactFlow>
    </div>
  );
}
