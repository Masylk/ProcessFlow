import { useState, useEffect, useRef } from 'react';
import AddBlockMenu from './AddBlockMenu';

interface AddBlockProps {
  id: number;
  alwaysDisplay?: boolean;
  selectedBlock: boolean; // New prop to determine z-index
}

export default function AddBlock({
  id,
  alwaysDisplay = false,
  selectedBlock,
}: AddBlockProps) {
  const [hovered, setHovered] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const toggleMenu = () => {
    setMenuVisible((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuVisible(false);
    }
  };

  useEffect(() => {
    if (menuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuVisible]);

  const showButton = alwaysDisplay || hovered;

  return (
    <div
      className={`flex justify-center w-48 relative`}
      style={{ zIndex: selectedBlock ? 10 : 50 }} // Adjust z-index based on selectedBlock
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showButton ? (
        <button
          onClick={toggleMenu}
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
      {menuVisible && (
        <div ref={menuRef} className="absolute top-full left-8 mt-2 z-10">
          <AddBlockMenu />
        </div>
      )}
      {/* Invisible hover area */}
      <div
        className="absolute top-[-50px] left-0 right-0 bottom-0 h-[100px]"
        style={{
          zIndex: -1,
          pointerEvents: 'none',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}
