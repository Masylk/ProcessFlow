import React, { useState, useEffect } from 'react';
import IconSelector from './IconSelector';
import { Block } from '../../types';
import { useColors, useThemeAssets } from '@/app/theme/hooks';
import { fetchSignedUrl } from '@/utils/supabase/fetch_url';

interface IconModifierProps {
  block: Block;
  onUpdate: (updatedBlock: Partial<Block>) => void;
}

export default function IconModifier({ block, onUpdate }: IconModifierProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const colors = useColors();
  const themeAssets = useThemeAssets();

  useEffect(() => {
    let isMounted = true;
    const getIconUrl = async () => {
      let iconPath: string;
      if (!block.icon) {
        iconPath = 'step-icons/default-icons/container.svg';
      } else if (block.icon.startsWith('https://cdn.brandfetch.io/')) {
        setIconUrl(block.icon);
        return;
      } else {
        iconPath = block.icon;
      }
      // Fetch signed URL for the icon (either default or custom)
      const signedUrl = await fetchSignedUrl(iconPath);
      if (isMounted) setIconUrl(signedUrl);
    };
    getIconUrl();
    return () => {
      isMounted = false;
    };
  }, [block.icon]);

  const handleIconSelect = (icon?: string) => {
    console.log('icon', icon);
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
        {iconUrl ? (
          <img
            src={iconUrl}
            alt="Selected Icon"
            className="w-6 h-auto object-contain select-none pointer-events-none"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="w-6 h-6 flex justify-center items-center" />
        )}
      </div>

      {/* Backdrop */}
      {showSelector && (
        <div
          className="fixed inset-0 z-50"
          style={{
            backgroundColor: colors['bg-overlay'],
            opacity: 0.5,
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
