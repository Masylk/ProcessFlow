// Sidebar.tsx
import React from 'react';

interface SidebarProps {
  onHideSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onHideSidebar }) => {
  return (
    <div className="flex flex-col h-full p-4 bg-gray-200">
      {/* Add your sidebar content here */}
      <button
        onClick={onHideSidebar}
        className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors mb-4 self-end"
      >
        Hide Sidebar
      </button>
      <div className="flex-1">
        {/* Sidebar content */}
        <p>Sidebar Content Here</p>
      </div>
    </div>
  );
};

export default Sidebar;
