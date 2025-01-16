import React, { useState, useEffect } from 'react';
import SidebarPath from './SidebarPath';
import { Block, BlockType } from '@/types/block';
import { SidebarEvent } from '../edit/page';
import { supabasePublic } from '@/lib/supabasePublicClient'; // Import the supabasePublic client

export interface SidebarBlock {
  id: number;
  type: BlockType;
  position: number;
  icon?: string;
  title?: string;
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
  isBackground: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarPath,
  workspaceId,
  workflowId,
  onSidebarEvent,
  isBackground,
}) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>(''); // State for search filter
  const [navigationIconUrl, setNavigationIconUrl] = useState<string | null>(
    null
  );
  const [searchIconUrl, setSearchIconUrl] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value); // Update the search filter state
  };

  // Fetch the public URLs for the icons
  useEffect(() => {
    const fetchIconUrls = async () => {
      const { data: navigationIconData } = await supabasePublic.storage
        .from('public-assets')
        .getPublicUrl('/assets/shared_components/navigation-icon.svg');

      const { data: searchIconData } = await supabasePublic.storage
        .from('public-assets')
        .getPublicUrl('/assets/shared_components/search-icon.svg');

      if (navigationIconData) {
        setNavigationIconUrl(navigationIconData.publicUrl);
      }

      if (searchIconData) {
        setSearchIconUrl(searchIconData.publicUrl);
      }
    };

    fetchIconUrls();
  }, []);

  return (
    <div className="fixed z-10 bg-white flex h-[93vh] top-[7vh]">
      {/* Sidebar with icons */}
      <div
        className={`w-15 h-full bg-white border border-[#e4e7ec] flex flex-col justify-between`}
      >
        <div className="flex flex-col pt-4 px-4 gap-6">
          {/* Implementing the icon */}
          <div
            className="w-6 h-6 bg-white rounded-md cursor-pointer"
            onClick={toggleSidebar}
          >
            {navigationIconUrl && (
              <img
                src={navigationIconUrl}
                alt="Navigation Icon"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Sidebar Content */}
      {isSidebarVisible && !isBackground && (
        <div
          className="flex-1 flex flex-col overflow-auto p-0 hide-scrollbar resize-x border border-gray-200"
          style={{
            minWidth: '250px', // Minimum width for the sidebar
            maxWidth: '500px', // Maximum width for the sidebar
          }}
        >
          {/* Header Section */}
          <div className="sticky top-0 z-10 h-[98px] left-0 px-2 pt-3 pb-7 border-b border-[#e4e7ec] flex-col justify-start items-start gap-4 inline-flex bg-white">
            <div className="self-stretch text-[#101828] text-base font-medium font-['Inter'] leading-normal">
              Navigation
            </div>
            {/* Search bar */}
            <div className="h-[26px] flex-col justify-start items-start gap-1.5 flex">
              <div className="px-2 py-1 bg-white rounded-md shadow border border-[#d0d5dd] justify-start items-center gap-2 inline-flex">
                <div className="grow shrink basis-0 h-[18px] justify-start items-center gap-2 flex">
                  <div className="w-4 h-4 relative">
                    {searchIconUrl && (
                      <img
                        src={searchIconUrl}
                        alt="Search Icon"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={handleSearchChange}
                    placeholder="Search"
                    className="w-[150px] text-[#667085] text-xs font-normal font-['Inter'] leading-[18px] outline-none"
                  />
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
              searchFilter={searchFilter} // Pass the filter as a prop
            />
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )}

      {/* Overlay */}
      {isBackground && (
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 z-20 pointer-events-auto"></div>
      )}
    </div>
  );
};

export default Sidebar;
