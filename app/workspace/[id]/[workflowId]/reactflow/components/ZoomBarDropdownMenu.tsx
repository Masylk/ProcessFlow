import React from 'react';
import { useReactFlow } from '@xyflow/react';

interface ZoomBarDropdownMenuProps {
  onClose: () => void;
  currentZoom: number;
}

const ZoomBarDropdownMenu: React.FC<ZoomBarDropdownMenuProps> = ({ onClose, currentZoom }) => {
  const { zoomTo, fitView } = useReactFlow();
  const zoomOptions = ['Fit to screen', '25%', '50%', '75%', '100%', '125%', '150%'];

  const handleZoomSelect = (option: string) => {
    if (option === 'Fit to screen') {
      fitView({ duration: 200 });
    } else {
      const zoomLevel = parseInt(option) / 100;
      zoomTo(zoomLevel, { duration: 200 });
    }
    onClose();
  };

  return (
    <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
      {zoomOptions.map((option) => (
        <button
          key={option}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
            option === `${currentZoom}%` ? 'text-blue-600' : 'text-gray-700'
          }`}
          onClick={() => handleZoomSelect(option)}
        >
          {option}
          {option === `${currentZoom}%` && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
};

export default ZoomBarDropdownMenu; 