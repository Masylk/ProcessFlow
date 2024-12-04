import React, { useEffect } from 'react';
import SidebarPath from './SidebarPath';
import { Block, BlockType } from '@/types/block';
import { TransformState } from '@/types/transformstate';
import { SidebarEvent } from '../page';

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
  handleBlocksReorder?: (reorderedBlocks: Block[]) => Promise<void>;
}

interface SidebarProps {
  onHideSidebar: () => void;
  initialPath: PathObject;
  workspaceId: string;
  workflowId: string;
  transformState: TransformState;
  onSidebarEvent: (eventData: SidebarEvent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onHideSidebar,
  initialPath,
  workspaceId,
  workflowId,
  transformState,
  onSidebarEvent,
}) => {
  return (
    <div className="flex flex-col overflow-auto h-full p-4 bg-gray-200">
      <button
        onClick={onHideSidebar}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors mb-4 self-end"
      >
        Hide Sidebar
      </button>
      <SidebarPath
        path={initialPath}
        transformState={transformState}
        onSidebarEvent={onSidebarEvent}
        workspaceId={workspaceId}
        workflowId={workflowId}
      />
    </div>
  );
};

export default Sidebar;
