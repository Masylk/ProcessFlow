import React, { useState } from 'react';
import SidebarPath from './SidebarPath';
import { Block, BlockType } from '@/types/block';
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
  sidebarPath: PathObject | null;
  workspaceId: string;
  workflowId: string;
  onSidebarEvent: (eventData: SidebarEvent) => void;
  selectedBlock: Block | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarPath,
  workspaceId,
  workflowId,
  onSidebarEvent,
  selectedBlock,
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  return (
    <div className="fixed z-10 bg-white flex h-full top-[67px]">
      {/* Sidebar with icons */}
      <div
        className={`w-15 h-full bg-white ${
          isSidebarVisible ? '' : ''
        } border border-[#e4e7ec] flex flex-col justify-between`}
      >
        <div className="flex flex-col pt-4 px-4 gap-6">
          {/* Implementing the icon */}
          <div
            className="w-6 h-6 bg-white rounded-md cursor-pointer"
            onClick={toggleSidebar}
          >
            <img
              src="/assets/shared_components/navigation-icon.svg"
              alt="Navigation Icon"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Main Sidebar Content */}
      {isSidebarVisible && (
        <div className="flex-1 flex flex-col overflow-auto p-0 hide-scrollbar">
          {/* Header Section */}
          <div className="sticky top-0 z-10 h-[98px] left-0 px-2 pt-3 pb-7 border-b border-[#e4e7ec] flex-col justify-start items-start gap-4 inline-flex bg-white">
            <div className="self-stretch text-[#101828] text-base font-medium font-['Inter'] leading-normal">
              Navigation
            </div>
            {/* Search bar */}
            <div className="self-stretch h-[26px] flex-col justify-start items-start gap-1.5 flex">
              <div className="self-stretch h-[26px] flex-col justify-start items-start gap-1.5 flex">
                <div className="self-stretch px-2 py-1 bg-white rounded-md shadow border border-[#d0d5dd] justify-start items-center gap-2 inline-flex">
                  <div className="grow shrink basis-0 h-[18px] justify-start items-center gap-2 flex">
                    <div className="w-4 h-4 relative">
                      <img
                        src="/assets/shared_components/search-icon.svg"
                        alt="Search Icon"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="w-[22px] text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
                      Search
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Path */}
          {sidebarPath ? (
            <SidebarPath
              path={sidebarPath}
              onSidebarEvent={onSidebarEvent}
              workspaceId={workspaceId}
              workflowId={workflowId}
              displayTitle={false}
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}

      {/* Overlay */}
      {selectedBlock && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-20 pointer-events-auto"></div>
      )}
    </div>
  );
};

export default Sidebar;
