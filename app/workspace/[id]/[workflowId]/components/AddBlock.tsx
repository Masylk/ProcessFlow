import { useState } from 'react';

interface AddBlockProps {
  id: number;
  onAdd: (position: number) => void;
  alwaysDisplay?: boolean;
}

export default function AddBlock({
  id,
  onAdd,
  alwaysDisplay = false,
}: AddBlockProps) {
  const [hovered, setHovered] = useState(false);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const showButton = alwaysDisplay || hovered;

  return (
    <div
      className="flex justify-center w-48 relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showButton ? (
        <button
          onClick={() => onAdd(id)}
          className="w-8 h-8 bg-white rounded-full border-2 border-[#4e6bd7] flex justify-center items-center"
        >
          <div className="self-stretch p-1 justify-center items-center inline-flex overflow-hidden">
            <div className="w-10 h-10 relative overflow-hidden">
              <img
                src="/assets/shared_components/plus-icon.svg"
                alt="Plus Icon"
                className="w-10 h-10"
              />
            </div>
          </div>
        </button>
      ) : (
        <svg width="5" height="32" xmlns="http://www.w3.org/2000/svg">
          <line
            x1="50%"
            y1="0%"
            x2="50%"
            y2="100%"
            stroke="#98a1b2"
            strokeWidth="2"
          />
        </svg>
      )}
      {/* Invisible hover area */}
      <div
        className="absolute top-0 left-0 right-0 bottom-0"
        style={{
          zIndex: -1,
          pointerEvents: 'none',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}
