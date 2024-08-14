'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import StatusIndicator from './components/StatusIndicator';
import AddBlockForm from './components/AddBlockForm';
import TitleBar from './components/TitleBar';
import { Block } from '@/types/block';

export default function WorkflowPage() {
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname.split('/');
  const workflowId = pathSegments[pathSegments.length - 1];
  const id = pathSegments[pathSegments.length - 2]; // This is your workspaceId
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [workflowTitle, setWorkflowTitle] = useState<string>(''); // State to hold the workflow title
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastRequestStatus, setLastRequestStatus] = useState<boolean | null>(
    null
  );
  const [isAddBlockFormOpen, setIsAddBlockFormOpen] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);

  useEffect(() => {
    if (id && workflowId) {
      fetchBlocks(id, workflowId);
      fetchWorkflowTitle(workflowId); // Fetch the title of the workflow
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

  const fetchWorkflowTitle = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflow/${workflowId}/title`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow title');
      }
      const data = await response.json();
      setWorkflowTitle(data.title);
    } catch (error) {
      console.error('Error fetching workflow title:', error);
    }
  };

  const updateWorkflowTitle = async (newTitle: string) => {
    try {
      const response = await fetch(`/api/workflow/${workflowId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update workflow title');
      }

      setWorkflowTitle(newTitle); // Update the title in the state
    } catch (error) {
      console.error('Error updating workflow title:', error);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const goBack = () => {
    router.back();
  };

  const handleAddBlockClick = (position: number) => {
    setInsertPosition(position);
    setIsAddBlockFormOpen(true);
  };

  const handleAddBlock = async (
    blockData: Pick<Block, 'description' | 'type'>
  ) => {
    setIsAddBlockFormOpen(false);
    if (insertPosition === null) return;

    try {
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...blockData,
          position: insertPosition,
          icon: 'default-icon',
          workflowId: parseInt(workflowId),
        }),
      });

      if (response.ok) {
        // Refetch the blocks to update the list
        fetchBlocks(id, workflowId);
      } else {
        console.error('Failed to create new block');
      }
    } catch (error) {
      console.error('Error creating new block:', error);
    }

    setInsertPosition(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TitleBar title={workflowTitle} onUpdateTitle={updateWorkflowTitle} />
      <div className="flex flex-1">
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isSidebarOpen ? 'w-64' : 'w-0'
          }`}
        >
          <Sidebar />
        </div>
        <main className="flex-1 bg-gray-100 p-6">
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
            onAddBlockClick={handleAddBlockClick}
          />
          {isAddBlockFormOpen && (
            <AddBlockForm
              onSubmit={handleAddBlock}
              onCancel={() => setIsAddBlockFormOpen(false)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
