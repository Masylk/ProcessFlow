import React, { useState, useEffect, useRef } from 'react';
import { Block } from '@/types/block';
import DelayBlockMenu from './DelayBlockMenu';
import { useColors } from '@/app/theme/hooks';

interface DelayBlockProps {
  block: Block;
  handleDeleteBlockFn: (blockId: number) => Promise<void>;
  handleBlockClick: (block: Block) => void;
}

function formatDelay(seconds: number) {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const parts = [];
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  }

  return parts.length > 1
    ? parts.slice(0, -1).join(', ') + ' and ' + parts.slice(-1)
    : parts[0];
}

const DelayBlock: React.FC<DelayBlockProps> = ({
  block,
  handleDeleteBlockFn,
  handleBlockClick,
}) => {
  const colors = useColors();
  const delay = block.delay_block?.seconds ?? 0;
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => setIsMenuVisible((prev) => !prev);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuVisible(false);
    }
  };

  useEffect(() => {
    if (isMenuVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuVisible]);

  return (
    <div
      id={`block:${block.id}`}
      style={{
        backgroundColor: colors['bg-primary'],
        borderColor: colors['border-secondary'],
      }}
      className="w-[481px] px-6 py-4 rounded-lg border flex flex-col gap-3"
      onClick={() => handleBlockClick(block)}
    >
      {/* Top Row: Icon, Text, and Menu */}
      <div className="flex justify-between items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            border: `1px solid ${colors['border-secondary']}`,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/calendar-heart-02.svg`}
            alt="Event-Based Delay"
            className="w-6 h-6"
          />
        </div>

        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <h3 
              style={{ color: colors['fg-primary'] }}
              className="text-sm font-medium"
            >
              Event-Based Delay
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMenu();
              }}
              className="p-1 rounded-md transition-colors hover:bg-opacity-80"
              style={{ 
                color: colors['fg-tertiary'],
                backgroundColor: 'transparent'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = colors['bg-secondary'];
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
                alt="Menu"
                className="w-4 h-4"
              />
            </button>
          </div>

          <p 
            style={{ color: colors['fg-tertiary'] }}
            className="text-sm mt-1"
          >
            Waiting for: User completes onboarding
          </p>
        </div>
      </div>

      {/* Divider */}
      <div 
        style={{ backgroundColor: colors['border-secondary'] }}
        className="h-px w-full" 
      />

      {/* Bottom Section */}
      <div className="flex items-center gap-2">
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/hourglass-01.svg`}
          alt="Hourglass"
          className="w-4 h-4"
        />
        <span 
          style={{ color: colors['fg-tertiary'] }}
          className="text-sm font-medium"
        >
          Expires after {formatDelay(delay)}
        </span>
      </div>

      {/* Warning Box */}
      <div 
        style={{
          backgroundColor: colors['bg-primary'],
          borderColor: colors['border-secondary']
        }}
        className="flex items-center gap-2 p-2 rounded-lg border"
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/alert-circle.svg`}
          alt="Alert"
          className="w-4 h-4"
        />
        <span 
          style={{ color: colors['fg-tertiary'] }}
          className="text-sm"
        >
          Flow paused until event occurs or time expires
        </span>
      </div>

      {/* Menu Dropdown */}
      {isMenuVisible && (
        <div
          ref={menuRef}
          className="absolute top-[30px] right-[-150px] mt-2"
        >
          <DelayBlockMenu
            blockId={block.id}
            handleDeleteBlockFn={handleDeleteBlockFn}
            handleBlockUpdate={() => {
              handleBlockClick(block);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DelayBlock;
