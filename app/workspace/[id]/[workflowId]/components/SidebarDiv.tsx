import React, { useState } from 'react';
import SidebarPath from './SidebarPath';
import { SidebarBlock } from './Sidebar';
import { SidebarEvent, SidebarEventType } from '../page';

export interface SidebarDivProps {
  block: SidebarBlock;
  onSidebarEvent: (eventData: SidebarEvent) => void;
  workspaceId: string;
  workflowId: string;
  searchFilter: string; // Add the searchFilter prop
}

const SidebarDiv: React.FC<SidebarDivProps> = ({
  block,
  onSidebarEvent,
  workspaceId,
  workflowId,
  searchFilter, // Destructure searchFilter
}) => {
  const [isSubpathsVisible, setIsSubpathsVisible] = useState(true);

  const MAX_DESCRIPTION_LENGTH = 15; // Set the maximum length for the description

  // Truncate text if it exceeds the maximum length
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Stops the click event from propagating to parent elements

    const targetElement = `block:${block.id}`;
    console.log('target element is: ', targetElement);
    onSidebarEvent({ type: SidebarEventType.FOCUS, focusId: targetElement });
  };

  const toggleSubpathsVisibility = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent parent click events
    setIsSubpathsVisible((prev) => !prev);
  };

  // Check if the block matches the search filter
  const matchesSearchFilter = block.description
    ?.toLowerCase()
    .includes(searchFilter.toLowerCase());

  return (
    <li
      className="flex flex-col items-start w-[181px] text-[#667085] text-xs font-medium font-['Inter'] leading-[18px] cursor-pointer"
      onClick={handleClick}
    >
      {/* Block Content */}
      {matchesSearchFilter && (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Drag Icon */}
            <div className="mr-0">
              <img
                src="/assets/shared_components/drag-icon.svg"
                alt="Drag Icon"
                className="w-4 h-4"
              />
            </div>

            {/* Block Icon */}
            {block.icon && (
              <div className="mr-1">
                <img src={block.icon} alt="Block Icon" className="w-4 h-4" />
              </div>
            )}

            {/* Description */}
            <div>
              {block.type}:{' '}
              {truncateText(
                block.description || 'No description',
                MAX_DESCRIPTION_LENGTH
              )}
            </div>
          </div>

          {/* Toggle Subpaths Icon */}
          {block.subpaths && block.subpaths.length > 0 && (
            <div
              className="cursor-pointer"
              onClick={toggleSubpathsVisibility}
              aria-label="Toggle Subpaths Visibility"
            >
              <img
                src={
                  isSubpathsVisible
                    ? '/assets/shared_components/chevron-down.svg'
                    : '/assets/shared_components/chevron-up.svg'
                }
                alt={isSubpathsVisible ? 'Collapse' : 'Expand'}
                className="w-4 h-4"
              />
            </div>
          )}
        </div>
      )}

      {/* Render subpaths if they exist and are visible */}
      {isSubpathsVisible && block.subpaths && block.subpaths.length > 0 && (
        <div className="ml-4 mt-0">
          {block.subpaths.map((subpath) => (
            <SidebarPath
              workspaceId={workspaceId}
              workflowId={workflowId}
              key={subpath.id}
              path={subpath}
              onSidebarEvent={onSidebarEvent}
              displayTitle={true}
              searchFilter={searchFilter}
            />
          ))}
        </div>
      )}
    </li>
  );
};

export default SidebarDiv;
