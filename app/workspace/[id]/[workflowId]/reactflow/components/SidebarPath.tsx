import React, { useState } from 'react';
import SidebarList from '@/app/workspace/[id]/[workflowId]/reactflow/components/SidebarList';
import { Block } from '@/types/block';
import { PathObject } from '@/types/sidebar';
import { useColors } from '@/app/theme/hooks';

interface SidebarPathProps {
  path: PathObject;
  onNodeFocus: (nodeId: string) => void;
  workspaceId: string;
  workflowId: string;
  defaultVisibility?: boolean;
  displayTitle?: boolean;
  searchFilter: string;
}

const SidebarPath: React.FC<SidebarPathProps> = ({
  path,
  onNodeFocus,
  workspaceId,
  workflowId,
  defaultVisibility = true,
  displayTitle = false,
  searchFilter,
}) => {
  const [isContentVisible, setIsContentVisible] = useState(defaultVisibility);
  const colors = useColors();

  // Construct URLs for icons
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  const gitBranchIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/git-branch-icon.svg`;
  const chevronDownIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/chevron-down.svg`;
  const chevronUpIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/chevron-up.svg`;

  const toggleContentVisibility = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsContentVisible((prev) => !prev);
  };

  const handleReorder = async (reorderedBlocks: Block[]) => {
    if (path.blocks && path.handleBlocksReorder) {
      // Update blocks in the path with the correct path_id
      const updatedBlocks = reorderedBlocks.map(block => ({
        ...block,
        path_id: path.id
      }));
      
      // Call the path's handleBlocksReorder function
      await path.handleBlocksReorder(updatedBlocks);
    }
  };

  return (
    <div 
      className="py-1 rounded mb-0"
      style={{ 
        backgroundColor: colors['bg-primary'] 
      }}
    >
      {/* Header with Toggle Icon */}
      {displayTitle && (
        <div 
          className="flex items-center space-x-1 cursor-pointer p-2 rounded-md hover:bg-gray-50" 
          onClick={toggleContentVisibility}
          style={{ 
            color: colors['text-primary'],
            backgroundColor: colors['bg-primary']
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = colors['bg-secondary'];
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = colors['bg-primary'];
          }}
        >
          <img
            src={gitBranchIconUrl}
            alt="Git Branch Icon"
            className="w-4 h-4"
          />
          <h2 
            className="text-sm font-semibold"
            style={{ color: colors['text-primary'] }}
          >
            {path.name}
          </h2>
          <img
            src={isContentVisible ? chevronDownIconUrl : chevronUpIconUrl}
            alt={isContentVisible ? "Collapse" : "Expand"}
            className="w-3 h-3"
          />
        </div>
      )}

      {/* Conditional Content Rendering */}
      {isContentVisible && path.blocks && path.blocks.length > 0 && (
        <div 
          className={`${displayTitle ? 'ml-3 mt-1' : ''}`}
          style={{ backgroundColor: colors['bg-primary'] }}
        >
          <SidebarList
            blocks={path.blocks as Block[]}
            onNodeFocus={onNodeFocus}
            onReorder={handleReorder}
            workspaceId={workspaceId}
            workflowId={workflowId}
            searchFilter={searchFilter}
          />
        </div>
      )}
    </div>
  );
};

export default SidebarPath; 