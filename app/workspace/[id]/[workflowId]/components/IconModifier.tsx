import React, { useState } from 'react';
import IconSelector from './IconSelector';

interface IconModifierProps {
  initialIcon?: string; // Optional initial icon
  onUpdate: (icon: string) => void; // Callback when an icon is updated
}

export default function IconModifier({
  initialIcon,
  onUpdate,
}: IconModifierProps) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || '');
  const [showSelector, setShowSelector] = useState(false);

  const handleIconSelect = (icon: string) => {
    setSelectedIcon(icon);
    onUpdate(icon);
    setShowSelector(false);
  };

  return (
    <div className="relative">
      {/* Icon Display */}
      <div
        className="p-2 bg-white rounded-lg shadow-inner border border-[#d0d5dd] flex justify-center items-center w-10 h-10 cursor-pointer"
        onClick={() => setShowSelector(!showSelector)}
      >
        {selectedIcon ? (
          <img src={selectedIcon} alt="Selected Icon" className="w-6 h-6" />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex justify-center items-center">
            <span className="text-gray-500 font-bold text-sm">i</span>
          </div>
        )}
      </div>

      {/* Icon Selector */}
      {showSelector && <IconSelector />}
    </div>
  );
}
