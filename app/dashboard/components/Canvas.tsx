'use client';

import { Folder, Workspace } from '@/types/workspace';
import React from 'react';
import CanvaHeader from './CanvaHeader';

interface CanvasProps {
  workspace: Workspace;
  selectedFolder?: Folder;
  openCreateFlow: () => void;
}

const Canvas: React.FC<CanvasProps> = ({
  workspace,
  selectedFolder,
  openCreateFlow,
}) => {
  return (
    <div className=" flex flex-col flex-1 w-full h-full bg-gray-100 border border-gray-300 p-4 rounded-lg shadow-md">
      <CanvaHeader
        openCreateFlow={openCreateFlow}
        selectedFolder={selectedFolder}
      />
      <h1 className="text-2xl font-semibold text-gray-800">
        {selectedFolder && selectedFolder.name}
      </h1>
    </div>
  );
};

export default Canvas;
