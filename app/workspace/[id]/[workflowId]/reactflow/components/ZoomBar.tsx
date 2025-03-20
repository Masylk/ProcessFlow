import React, { useState, useEffect } from 'react';
import { useReactFlow, useStore } from '@xyflow/react';
import ZoomBarDropdownMenu from './ZoomBarDropdownMenu';

interface ZoomBarProps {
  className?: string;
}

const ZoomBar: React.FC<ZoomBarProps> = ({ className = '' }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const { zoomIn, zoomOut } = useReactFlow();

  // Get the current zoom level from ReactFlow store
  const zoom = useStore((state) => state.transform[2]);
  const zoomPercentage = Math.round(zoom * 100);

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  return (
    <div
      className={`h-10 overflow-hidden rounded-lg border border-[#d0d5dd] justify-start items-start inline-flex shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18),inset_0px_-2px_0px_rgba(16,24,40,0.05),0px_1px_2px_rgba(16,24,40,0.05)] ${className}`}
    >
      {/* Zoom Out Button */}
      <div
        onClick={handleZoomOut}
        className="px-3 py-2 h-full bg-white border-[#d0d5dd] justify-center items-center gap-2 flex cursor-pointer hover:bg-gray-50"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/zoom-out.svg`}
          alt="Zoom Out"
          className="w-5 h-5"
        />
      </div>

      {/* Zoom Percentage Button */}
      <button
        onClick={() => setIsDropdownVisible(!isDropdownVisible)}
        className="px-3 py-2 h-full bg-white border-l border-r border-[#d0d5dd] justify-center items-center gap-2 flex cursor-pointer hover:bg-gray-50"
      >
        <span className="text-sm font-semibold text-[#344054]">
          {zoomPercentage}%
        </span>
      </button>

      {/* Zoom In Button */}
      <div
        onClick={handleZoomIn}
        className="px-3 py-2 h-full bg-white border-[#d0d5dd] justify-center items-center gap-2 flex cursor-pointer hover:bg-gray-50"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/zoom-in.svg`}
          alt="Zoom In"
          className="w-5 h-5"
        />
      </div>

      {/* Dropdown Menu */}
      {isDropdownVisible && (
        <ZoomBarDropdownMenu
          onClose={() => setIsDropdownVisible(false)}
          currentZoom={zoomPercentage}
        />
      )}
    </div>
  );
};

export default ZoomBar;
