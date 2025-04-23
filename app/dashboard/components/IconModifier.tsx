import React, { useState, useEffect } from 'react';
import IconSelector from './IconSelector';
import { useColors } from '@/app/theme/hooks';

interface IconModifierProps {
  initialIcon?: string; // Optional initial icon
  emote?: string;
  onUpdate: (icon?: string, emote?: string) => void; // Callback when an icon is updated
  allowEmoji?: boolean;  // Add this prop
}

export default function IconModifier({
  initialIcon,
  onUpdate,
  emote,
  allowEmoji = true  // Default to true
}: IconModifierProps) {
  const colors = useColors();
  const [showSelector, setShowSelector] = useState(false);

  const handleIconSelect = (icon?: string, emote?: string) => {
    if (icon) {
      // If an icon is selected, clear the emote
      onUpdate(icon, undefined);
    } else if (emote) {
      // If an emote is selected, clear the icon
      onUpdate(undefined, emote);
    } else {
      // If neither, clear both
      onUpdate(undefined, undefined);
    }
    setShowSelector(false);
  };

  const handleOverlayClick = () => {
    setShowSelector(false);
  };

  return (
    <div className="relative">
      {/* Icon Display */}
      <div
        className="p-2 rounded-md shadow-inner flex justify-center items-center w-10 cursor-pointer transition-colors duration-200"
        style={{
          backgroundColor: colors['bg-primary'],
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: colors['border-secondary'],
        }}
        onClick={() => setShowSelector(!showSelector)}
      >
        {initialIcon ? (
          <img
            src={initialIcon.startsWith('https://cdn.brandfetch.io/') 
              ? initialIcon 
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${initialIcon}`}
            alt="Selected Icon"
            className="w-6 h-6 select-none pointer-events-none"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : emote ? (
          <div className="w-6 h-6 flex items-center justify-center">
            {emote}
          </div>
        ) : (
          <div className="w-6 h-6 flex justify-center items-center">
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`}
              alt="Default Icon"
              className="w-6 h-6 select-none pointer-events-none"
            />
          </div>
        )}
      </div>

      {/* Backdrop */}
      {showSelector && (
        <div className="fixed inset-0 z-50">
          <div 
            style={{ backgroundColor: colors['bg-overlay'] }}
            className="absolute inset-0 opacity-70" 
            onClick={handleOverlayClick}
          />
        </div>
      )}

      {/* Icon Selector */}
      {showSelector && (
        <div className="absolute top-12 left-0 z-50">
          <IconSelector 
            onSelect={handleIconSelect} 
            allowEmoji={allowEmoji}
          />
        </div>
      )}
    </div>
  );
}
