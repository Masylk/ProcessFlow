import React, { useState, useEffect } from 'react';
import SidebarPath from './SidebarPath';
import { SidebarBlock } from './Sidebar';
import { SidebarEvent, SidebarEventType } from '../edit/page';
import { DraggableProvidedDragHandleProps } from 'react-beautiful-dnd'; // Import type
import DOMPurify from 'dompurify';

export interface SidebarDivProps {
  block: SidebarBlock;
  onSidebarEvent: (eventData: SidebarEvent) => void;
  workspaceId: string;
  workflowId: string;
  searchFilter: string;
  dragHandleProps?: DraggableProvidedDragHandleProps | null; // Update type
}

const SidebarDiv: React.FC<SidebarDivProps> = ({
  block,
  onSidebarEvent,
  workspaceId,
  workflowId,
  searchFilter,
  dragHandleProps,
}) => {
  const [isSubpathsVisible, setIsSubpathsVisible] = useState(true);
  const [iconUrl, setIconUrl] = useState<string | null>(null); // State for signed URL

  const MAX_DESCRIPTION_LENGTH = 15;

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const targetElement = `block:${block.id}`;
    console.log('target element is: ', targetElement);
    onSidebarEvent({ type: SidebarEventType.FOCUS, focusId: targetElement });
  };

  const toggleSubpathsVisibility = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsSubpathsVisible((prev) => !prev);
  };

  const sanitizeAndTruncate = (text: string, maxLength: number): string => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = DOMPurify.sanitize(text); // Sanitize the input
    const sanitizedText =
      tempElement.textContent || tempElement.innerText || '';

    return sanitizedText.length > maxLength
      ? sanitizedText.slice(0, maxLength) + '...'
      : sanitizedText;
  };

  const matchesSearchFilter = block.description
    ?.toLowerCase()
    .includes(searchFilter.toLowerCase());

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        if (block.icon) {
          const response = await fetch(
            `/api/get-signed-url?path=${encodeURIComponent(block.icon)}`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch signed URL');
          }
          const { signedUrl } = await response.json();
          setIconUrl(signedUrl);
        }
      } catch (error) {
        console.error('Error fetching signed URL:', error);
      }
    };

    fetchSignedUrl();
  }, [block.icon]);

  return (
    <li className="flex flex-col items-start w-[181px] text-[#667085] text-xs font-medium font-['Inter'] leading-[18px] ">
      {matchesSearchFilter && (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            {/* Drag Icon */}
            <div className="mr-0" {...(dragHandleProps || {})}>
              <img
                src="/assets/shared_components/drag-icon.svg"
                alt="Drag Icon"
                className="w-4 h-4 cursor-grab"
              />
            </div>

            {/* Block Icon */}
            <div className="mr-1">
              <img
                src={
                  block.type === 'DELAY'
                    ? '/assets/workflow/delay-clock-icon.svg'
                    : iconUrl || block.icon
                }
                alt="Block Icon"
                className="w-4 h-4"
              />
            </div>

            {/* Description */}
            <div className="cursor-pointer" onClick={handleClick}>
              {block.title || block.type}
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
