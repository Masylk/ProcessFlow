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
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Stops the click event from propagating to parent elements

    const targetElement = `block:${block.id}`;
    console.log('target element is: ', targetElement);
    onSidebarEvent({ type: SidebarEventType.FOCUS, focusId: targetElement });
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
