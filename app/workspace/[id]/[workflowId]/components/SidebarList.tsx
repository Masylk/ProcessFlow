import React from 'react';
import { SidebarBlock } from './Sidebar';
import SidebarPath from './SidebarPath';

interface SidebarListProps {
  blocks: SidebarBlock[];
}

const SidebarList: React.FC<SidebarListProps> = ({ blocks }) => {
  return (
    <ul className="space-y-1">
      {blocks.map((block) => (
        <li key={block.id} className="text-gray-800">
          {block.type}: {block.description || 'No description'}
          {/* Render subpaths if they exist */}
          {block.subpaths && block.subpaths.length > 0 && (
            <div className="ml-4 mt-2">
              {block.subpaths.map((subpath) => (
                <SidebarPath key={subpath.id} path={subpath} />
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default SidebarList;
