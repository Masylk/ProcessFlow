import React, { useState, useRef, useEffect } from 'react';
import IconSelector from './IconSelector';
import { useColors } from '@/app/theme/hooks';
import ReactDOM from 'react-dom';

interface IconModifierProps {
  initialIcon?: string; // Optional initial icon
  emote?: string;
  onUpdate: (icon?: string, emote?: string) => void; // Callback when an icon is updated
  allowEmoji?: boolean; // Add this prop
}

export default function IconModifier({
  initialIcon,
  onUpdate,
  emote,
  allowEmoji = true, // Default to true
}: IconModifierProps) {
  const colors = useColors();
  const [showSelector, setShowSelector] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const iconButtonRef = useRef<HTMLDivElement>(null);

  // Calculate and set the position for the IconSelector
  useEffect(() => {
    if (showSelector && iconButtonRef.current) {
      const rect = iconButtonRef.current.getBoundingClientRect();
      // Place the selector below the icon button, with a small gap
      setSelectorPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [showSelector]);

  // Only close selector on Escape key
  useEffect(() => {
    if (!showSelector) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSelector(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showSelector]);

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

  // The icon button
  const iconButton = (
    <div
      ref={iconButtonRef}
      className="p-2 rounded-md shadow-inner flex justify-center items-center w-10 cursor-pointer transition-colors duration-200"
      style={{
        backgroundColor: colors['bg-primary'],
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: colors['border-secondary'],
      }}
      onClick={() => setShowSelector((v) => !v)}
    >
      {initialIcon ? (
        <img
          src={
            initialIcon.startsWith('https://cdn.brandfetch.io/')
              ? initialIcon
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${initialIcon}`
          }
          alt="Selected Icon"
          className="w-6 h-6 select-none pointer-events-none"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : emote ? (
        <div className="w-6 h-6 flex items-center justify-center">{emote}</div>
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
  );

  // Only render the selector, no backdrop
  const selectorPortal =
    showSelector && selectorPosition
      ? ReactDOM.createPortal(
          <div
            className="fixed z-[10000]"
            style={{
              top: selectorPosition.top,
              left: selectorPosition.left,
            }}
          >
            <IconSelector onSelect={handleIconSelect} allowEmoji={allowEmoji} />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {iconButton}
      {selectorPortal}
    </>
  );
}
