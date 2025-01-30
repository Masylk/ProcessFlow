import React, { useState } from 'react';
import SidebarList from './SidebarList';
import { Path } from '@/types/path';

interface SidebarPathProps {
  path: Path;
  defaultVisibility?: boolean;
  displayTitle?: boolean;
}

const SidebarPath: React.FC<SidebarPathProps> = ({
  path,
  defaultVisibility = true,
  displayTitle = true,
}) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  const [isContentVisible, setIsContentVisible] = useState(defaultVisibility);
  const gitBranchIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/git-branch-icon.svg`;

  const chevronDownIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/chevron-down.svg`;
  const chevronUpIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/chevron-right.svg`;

  const toggleContentVisibility = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsContentVisible((prev) => !prev);
  };

  return (
    <div className="py-1 rounded mb-0 overflow-auto">
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

      {isContentVisible && path.blocks && path.blocks.length > 0 && (
        <div className={`${displayTitle ? 'ml-2' : ''}`}>
          <SidebarList blocks={path.blocks} />
        </div>
      )}
    </div>
  );
};

export default SidebarPath;
