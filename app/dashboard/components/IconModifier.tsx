import React, { useState, useEffect } from 'react';
import IconSelector from './IconSelector';

interface IconModifierProps {
  initialIcon?: string; // Optional initial icon
  emote?: string;
  onUpdate: (icon?: string, emote?: string) => void; // Callback when an icon is updated
}

export default function IconModifier({
  initialIcon,
  onUpdate,
  emote,
}: IconModifierProps) {
  const [showSelector, setShowSelector] = useState(false);

  const handleIconSelect = (icon?: string, emote?: string) => {
    console.log('updating icon with: ' + icon);
    onUpdate(icon, emote);
    setShowSelector(false);
  };

  const handleOverlayClick = () => {
    setShowSelector(false);
  };

  return (
    <div className="relative">
      {/* Icon Display */}
      <div
        className="p-2 bg-white rounded-lg shadow-inner border border-[#d0d5dd] flex justify-center items-center w-10 h-10 cursor-pointer"
        onClick={() => setShowSelector(!showSelector)}
      >
        {initialIcon ? (
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${initialIcon}`}
            alt="Selected Icon"
            className="w-6 h-6"
          />
        ) : emote ? (
          <div>{emote}</div>
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex justify-center items-center">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`}
              alt="Default Icon"
              className="w-6 h-6"
            />
          </div>
        )}
      </div>

      {/* Black transparent overlay */}
      {showSelector && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={handleOverlayClick}
        />
      )}

      {/* Icon Selector */}
      {showSelector && (
        <div className="absolute top-12 left-0 z-20">
          <IconSelector onSelect={handleIconSelect} />
        </div>
      )}
    </div>
  );
}
