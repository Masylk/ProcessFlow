import React, { useState, useEffect } from 'react';
import SidebarList from './SidebarList';
import { PathObject, SidebarBlock } from './Sidebar';
import { SidebarEvent } from '../edit/page';
import { Block } from '@/types/block';
import { supabasePublic } from '@/lib/supabasePublicClient'; // Import the supabasePublic client

interface SidebarPathProps {
  path: PathObject;
  onSidebarEvent: (eventData: SidebarEvent) => void;
  workspaceId: string;
  workflowId: string;
  defaultVisibility?: boolean; // Add prop to control default visibility
  displayTitle?: boolean;
  searchFilter: string; // Add searchFilter prop
}

const SidebarPath: React.FC<SidebarPathProps> = ({
  path,
  onSidebarEvent,
  workspaceId,
  workflowId,
  defaultVisibility = true, // Default to true if not provided
  displayTitle = false,
  searchFilter, // Destructure searchFilter prop
}) => {
  const [isContentVisible, setIsContentVisible] = useState(defaultVisibility);
  const [gitBranchIconUrl, setGitBranchIconUrl] = useState<string | null>(null);
  const [chevronDownIconUrl, setChevronDownIconUrl] = useState<string | null>(
    null
  );
  const [chevronUpIconUrl, setChevronUpIconUrl] = useState<string | null>(null);

  const toggleContentVisibility = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering parent events
    setIsContentVisible((prev) => !prev);
  };

  const handleReorder = async (reorderedBlocks: SidebarBlock[]) => {
    if (path.blocks) {
      path.blocks = reorderedBlocks.map(
        (block) =>
          path.blocks!.find((originalBlock) => originalBlock.id === block.id)!
      );

      const convertedBlocks: Block[] = path.blocks.map((sidebarBlock) => ({
        id: sidebarBlock.id,
        type: sidebarBlock.type,
        position: sidebarBlock.position,
        title: sidebarBlock.title || 'Default Title',
        icon: sidebarBlock.icon,
        description: sidebarBlock.description,
        pathId: path.id,
        workflowId: Number(workflowId),
      }));

      if (path.handleBlocksReorder) {
        await path.handleBlocksReorder(convertedBlocks);
      }
    }
  };

  // Fetch the public URLs for the icons
  useEffect(() => {
    const fetchIconUrls = async () => {
      const { data: gitBranchIconData } = await supabasePublic.storage
        .from('public-assets')
        .getPublicUrl('/assets/shared_components/git-branch-icon.svg');

      const { data: chevronDownIconData } = await supabasePublic.storage
        .from('public-assets')
        .getPublicUrl('/assets/shared_components/chevron-down.svg');

      const { data: chevronUpIconData } = await supabasePublic.storage
        .from('public-assets')
        .getPublicUrl('/assets/shared_components/chevron-up.svg');

      if (gitBranchIconData) {
        setGitBranchIconUrl(gitBranchIconData.publicUrl);
      }

      if (chevronDownIconData) {
        setChevronDownIconUrl(chevronDownIconData.publicUrl);
      }

      if (chevronUpIconData) {
        setChevronUpIconUrl(chevronUpIconData.publicUrl);
      }
    };

    fetchIconUrls();
  }, []);

  return (
    <div className="py-1 rounded mb-0">
      {/* Header with Toggle Icon */}
      {displayTitle && (
        <div className="flex justify-start items-start">
          <div className="mr-1">
            {gitBranchIconUrl && (
              <img
                src={gitBranchIconUrl}
                alt="Git Branch Icon"
                className="w-4 h-4"
              />
            )}
          </div>
          <h2 className="text-sm font-semibold">{path.name}</h2>
          <div
            className="cursor-pointer"
            onClick={toggleContentVisibility}
            aria-label="Toggle Content Visibility"
          >
            {isContentVisible && chevronDownIconUrl ? (
              <img
                src={chevronDownIconUrl}
                alt="Collapse"
                className="w-3 h-3 mt-1 ml-1"
              />
            ) : chevronUpIconUrl ? (
              <img
                src={chevronUpIconUrl}
                alt="Expand"
                className="w-3 h-3 mt-1 ml-1"
              />
            ) : null}
          </div>
        </div>
      )}

      {/* Conditional Rendering Based on isContentVisible */}
      {isContentVisible && path.blocks && path.blocks.length > 0 && (
        <div className={`${displayTitle ? 'ml-2' : ''}`}>
          <SidebarList
            blocks={path.blocks} // Pass all blocks
            onSidebarEvent={onSidebarEvent}
            onReorder={handleReorder}
            workspaceId={workspaceId}
            workflowId={workflowId}
            searchFilter={searchFilter} // Pass the searchFilter as a new prop
          />
        </div>
      )}
    </div>
  );
};

export default SidebarPath;
