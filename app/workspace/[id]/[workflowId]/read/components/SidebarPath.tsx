import React, { useEffect, useState } from 'react';
import SidebarList from './SidebarList';
import { Path } from '@/types/path';
import { Block } from '@/types/block';

interface PathData {
  id: number;
  name: string;
  workflow_id: number;
  path_blockId?: number;
  blocks: Block[];
}

interface SidebarPathProps {
  path: Path;
  workspaceId: number;
  defaultVisibility?: boolean;
  displayTitle?: boolean;
}

const SidebarPath: React.FC<SidebarPathProps> = ({
  path,
  workspaceId,
  defaultVisibility = true,
  displayTitle = true,
}) => {
  const [pathData, setPathData] = useState<PathData | null>(null);
  const [blockList, setBlockList] = useState<Block[]>([]);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  const [isContentVisible, setIsContentVisible] = useState(defaultVisibility);
  const gitBranchIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/git-branch-icon.svg`;

  const chevronDownIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/chevron-down.svg`;
  const chevronUpIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/chevron-right.svg`;

  useEffect(() => {
    const fetchPathData = async () => {
      try {
        const response = await fetch(
          `/api/workspace/${workspaceId}/paths/${path.id}?workflow_id=${path.workflow_id}`
        );

        if (response.ok) {
          const fetchedPathData: PathData = await response.json();

          setBlockList(fetchedPathData.blocks);
          setPathData(fetchedPathData);
        } else {
          console.error('Failed to fetch path data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching path data:', error);
      }
    };

    fetchPathData();
  }, []);

  const toggleContentVisibility = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsContentVisible((prev) => !prev);
  };

  return (
    <div className="py-1 rounded mb-0">
      {/* Header with Toggle Icon */}
      {displayTitle && (
        <div className="flex justify-start items-start">
          <div className="mr-1">
            <img
              src={gitBranchIconUrl}
              alt="Git Branch Icon"
              className="w-4 h-4"
            />
          </div>
          <h2 className="text-sm font-semibold">{path.name}</h2>
          <div
            className="cursor-pointer"
            onClick={toggleContentVisibility}
            aria-label="Toggle Content Visibility"
          >
            {isContentVisible ? (
              <img
                src={chevronDownIconUrl}
                alt="Collapse"
                className="w-3 h-3 mt-1 ml-1"
              />
            ) : (
              <img
                src={chevronUpIconUrl}
                alt="Expand"
                className="w-3 h-3 mt-1 ml-1"
              />
            )}
          </div>
        </div>
      )}

      {isContentVisible && (
        <div className={`${displayTitle ? 'ml-2' : ''}`}>
          <SidebarList blocks={blockList} workspaceId={workspaceId} />
        </div>
      )}
    </div>
  );
};

export default SidebarPath;
