'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import StatusIndicator from './components/StatusIndicator';
import { Block } from '@/types/block';

export default function WorkflowPage() {
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname.split('/');
  const workflowId = pathSegments[pathSegments.length - 1];
  const id = pathSegments[pathSegments.length - 2]; // This is your workspaceId
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastRequestStatus, setLastRequestStatus] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (id && workflowId) {
      fetchBlocks(id, workflowId);
    }
  }, [id, workflowId]);

  const fetchBlocks = async (id: string, workflowId: string) => {
    try {
      const response = await fetch(
        `/api/workspace/${id}/blocks?workflowId=${workflowId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch blocks');
      }
      const data = await response.json();
      setBlocks(data);
      setLastRequestStatus(true);
    } catch (error) {
      console.error('Error fetching blocks:', error);
      setLastRequestStatus(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <div className="flex">
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isSidebarOpen ? 'w-64' : 'w-0'
        }`}
      >
        <Sidebar />
      </div>
      <main className="flex-1 min-h-screen bg-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            </button>
            <button
              onClick={goBack}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
          </div>
          <StatusIndicator isSuccess={lastRequestStatus} />
        </div>
        <Canvas
          initialBlocks={blocks}
          workspaceId={id}
          workflowId={workflowId}
          onAddBlock={() => fetchBlocks(id, workflowId)}
        />
      </main>
    </div>
  );
}