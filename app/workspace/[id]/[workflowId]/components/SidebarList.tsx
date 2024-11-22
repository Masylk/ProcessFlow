import React from 'react';
import SidebarDiv from './SidebarDiv';
import { SidebarBlock } from './Sidebar';
import { TransformState } from '@/types/transformstate';
import { SidebarEvent } from '../page';

interface SidebarListProps {
  blocks: SidebarBlock[];
  transformState: TransformState;
  onSidebarEvent: (eventData: SidebarEvent) => void;
}

const SidebarList: React.FC<SidebarListProps> = ({
  blocks,
  transformState,
  onSidebarEvent,
}) => {
  return (
    <ul className="space-y-1">
      {blocks.map((block) => (
        <SidebarDiv
          key={block.id}
          block={block}
          transformState={transformState}
          onSidebarEvent={onSidebarEvent}
        />
      ))}
    </ul>
  );
};

export default SidebarList;
