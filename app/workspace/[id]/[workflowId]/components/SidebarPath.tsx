import React from 'react';
import SidebarList from './SidebarList';
import { PathObject } from './Sidebar';
import { TransformState } from '@/types/transformstate';
import { SidebarEvent } from '../page';

interface SidebarPathProps {
  path: PathObject;
  transformState: TransformState;
  onSidebarEvent: (eventData: SidebarEvent) => void;
}

const SidebarPath: React.FC<SidebarPathProps> = ({
  path,
  transformState,
  onSidebarEvent,
}) => {
  return (
    <div className="p-4 bg-white shadow-md rounded mb-4">
      <h2 className="text-xl font-semibold mb-2">{path.name}</h2>
      {path.blocks && path.blocks.length > 0 && (
        <SidebarList
          blocks={path.blocks}
          transformState={transformState}
          onSidebarEvent={onSidebarEvent}
        />
      )}
    </div>
  );
};

export default SidebarPath;
