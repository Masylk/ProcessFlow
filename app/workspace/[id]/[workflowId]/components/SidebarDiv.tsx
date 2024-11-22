import React from 'react';
import SidebarPath from './SidebarPath';
import { SidebarBlock } from './Sidebar';
import { TransformState } from '@/types/transformstate';
import { SidebarEvent, SidebarEventType } from '../page';

export interface SidebarDivProps {
  block: SidebarBlock;
  transformState: TransformState;
  onSidebarEvent: (eventData: SidebarEvent) => void;
}

const SidebarDiv: React.FC<SidebarDivProps> = ({
  block,
  transformState,
  onSidebarEvent,
}) => {
  const handleClick = () => {
    const targetElement = document.getElementById(`block:${block.id}`);
    if (targetElement) {
      // Get the target element's bounding box
      const rect = targetElement.getBoundingClientRect();

      onSidebarEvent({ type: SidebarEventType.FOCUS, focusPos: rect });
      // Calculate the actual position within the canvas, considering the transform state
      // const canvasX =
      //   (rect.left + rect.width / 2 - window.innerWidth / 2) /
      //     transformState.scale -
      //   transformState.positionX;
      // const canvasY =
      //   (rect.top + rect.height / 2 - window.innerHeight / 2) /
      //     transformState.scale -
      //   transformState.positionY;

      // // Apply the new position to center the target element
      // const container = document.querySelector('.react-transform-wrapper');
      // if (container) {
      //   container.scrollBy({
      //     left: canvasX,
      //     top: canvasY,
      //     behavior: 'smooth', // Smooth scrolling for better UX
      //   });
      //   console.log(`Scrolled to block:${block.id}`);
      // }
    } else {
      console.log(`Element with ID block:${block.id} not found.`);
    }
  };

  return (
    <li className="text-gray-800 cursor-pointer" onClick={handleClick}>
      {block.type}: {block.description || 'No description'}
      {/* Render subpaths if they exist */}
      {block.subpaths && block.subpaths.length > 0 && (
        <div className="ml-4 mt-2">
          {block.subpaths.map((subpath) => (
            <SidebarPath
              key={subpath.id}
              path={subpath}
              transformState={transformState}
              onSidebarEvent={onSidebarEvent}
            />
          ))}
        </div>
      )}
    </li>
  );
};

export default SidebarDiv;
