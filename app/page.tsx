import React from 'react';
import { Block } from '@/types/block';
import Canvas from '@/app/components/Canvas';
import Sidebar from './components/Sidebar';

const initialBlocks: Block[] = [
  {
    id: 1,
    type: 'Example Block',
    position: 1,
    icon: '/path/to/icon.png',
    description: 'This is an example block description.',
    // workflowId: 101,
    // workflow: { id: 101, name: 'Workflow A' },
    // actions: [],
  },
  // Add more blocks as needed...
];

export default function Home() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-gray-100 p-6">
        <Canvas initialBlocks={initialBlocks} />
      </main>
    </div>
  );
}
