import React from 'react';
import SidebarList from './SidebarList';
import { PathObject } from './Sidebar';

interface SidebarPathProps {
  path: PathObject;
}

const SidebarPath: React.FC<SidebarPathProps> = ({ path }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded mb-4">
      <h2 className="text-xl font-semibold mb-2">{path.name}</h2>
      {path.blocks && path.blocks.length > 0 && (
        <SidebarList blocks={path.blocks} />
      )}
    </div>
  );
};

export default SidebarPath;
