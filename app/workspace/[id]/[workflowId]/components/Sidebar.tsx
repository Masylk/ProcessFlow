import React, { useEffect } from 'react';
import SidebarPath from './SidebarPath';
import { BlockType } from '@/types/block';

export interface SidebarBlock {
  id: number;
  type: BlockType;
  position: number;
  icon?: string;
  description?: string;
  subpaths?: PathObject[];
}

export interface PathObject {
  id: number;
  name: string;
  blocks?: SidebarBlock[];
}

interface SidebarProps {
  onHideSidebar: () => void;
  initialPath: PathObject;
  workspaceId: string;
  workflowId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onHideSidebar, initialPath }) => {
  // Log initialPath whenever it changes
  useEffect(() => {
    console.log('Initial Path:', initialPath);
  }, [initialPath]);

  return (
    <div className="flex flex-col h-full p-4 bg-gray-200">
      <button
        onClick={onHideSidebar}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors mb-4 self-end"
      >
        Hide Sidebar
      </button>
      <SidebarPath path={initialPath} />
    </div>
  );
};

export default Sidebar;
