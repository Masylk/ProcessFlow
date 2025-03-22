import React, { useState } from 'react';
import IconSelector from './IconSelector';
import { Block } from '../types';
import { useColors, useThemeAssets } from '@/app/theme/hooks';

interface IconModifierProps {
  block: Block;
  onUpdate: (updatedBlock: Partial<Block>) => void;
}

export default function IconModifier({ block, onUpdate }: IconModifierProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const colors = useColors();
  const themeAssets = useThemeAssets();

  const handleIconSelect = (icon?: string) => {
    if (icon) {
      onUpdate({ icon });
    } else {
      onUpdate({ icon: undefined });
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
        className="w-10 h-10 rounded-lg border flex items-center justify-center cursor-pointer transition-colors duration-200"
        style={{ 
          borderColor: colors['border-primary'],
          backgroundColor: showSelector 
            ? colors['bg-active']
            : isHovering 
              ? colors['bg-primary_hover']
              : 'transparent',
        }}
        onClick={() => setShowSelector(!showSelector)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {block.icon ? (
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${block.icon}`}
            alt="Selected Icon"
            className="w-6 h-6"
          />
        ) : (
          <div className="w-6 h-6 flex justify-center items-center">
            <img
              src={themeAssets.icons?.['folder'] || `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`}
              alt="Default Icon"
              className="w-6 h-6"
            />
          </div>
        )}
      </div>

      {/* Backdrop */}
      {showSelector && (
        <div
          className="fixed inset-0"
          style={{ 
            backgroundColor: colors['bg-overlay'],
            opacity: 0.50 
          }}
          onClick={handleOverlayClick}
        />
      )}

      {/* Icon Selector */}
      {showSelector && (
        <div className="absolute top-12 left-0 z-50">
          <IconSelector onSelect={handleIconSelect} />
        </div>
      )}
    </div>
  );
}
