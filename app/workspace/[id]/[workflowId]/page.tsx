'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import StatusIndicator from './components/StatusIndicator';
import TitleBar from './components/TitleBar';
import { Path } from '@/types/path';
import { BlockProvider } from './components/BlockContext'; // Adjust path as needed

export default function WorkflowPage() {
  const pathname = usePathname();
  const router = useRouter();
  const pathSegments = pathname.split('/');
  const workflowId = pathSegments[pathSegments.length - 1];
  const id = pathSegments[pathSegments.length - 2]; // This is your workspaceId
  const [path, setPath] = useState<Path | null>(null);
  const [workflowTitle, setWorkflowTitle] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastRequestStatus, setLastRequestStatus] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    if (id && workflowId) {
      fetchPaths(id, workflowId);
      fetchWorkflowTitle(workflowId);
    }
  }, [id, workflowId]);

  const fetchPaths = async (id: string, workflowId: string) => {
    try {
      const response = await fetch(
        `/api/workspace/${id}/paths?workflowId=${workflowId}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch paths');
      }
      const data = await response.json();
      setPath(data.paths && data.paths[0] ? data.paths[0] : null);
      setLastRequestStatus(true);
    } catch (error) {
      console.error('Error fetching paths:', error);
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

      setWorkflowTitle(newTitle);
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

  return (
    <body className=" overflow-hidden h-screen w-screen">
      <div className="relative flex flex-col w-full">
        <TitleBar title={workflowTitle} onUpdateTitle={updateWorkflowTitle} />

        <div className="flex flex-1">
          {/* Sidebar with absolute positioning to avoid affecting the canvas size */}
          <div
            className={`absolute inset-y-0 left-0 z-10 bg-white transition-transform duration-300 ease-in-out ${
              isSidebarOpen
                ? 'translate-x-0 w-64'
                : '-translate-x-full w-0 hidden'
            }`}
          >
            <Sidebar onHideSidebar={toggleSidebar} />{' '}
            {/* Pass the toggleSidebar function */}
          </div>

          {/* Main content area remains full width and unaffected by the sidebar */}
          <main className="flex-1 bg-gray-100 p-6 ml-0 h-screen w-screen overflow-hidden">
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
            {path ? (
              <BlockProvider>
                <Canvas
                  initialPath={path}
                  workspaceId={id}
                  workflowId={workflowId}
                />
              </BlockProvider>
            ) : (
              <p>Loading path...</p>
            )}
          </main>
        </div>
      </div>
    </body>
  );
}
