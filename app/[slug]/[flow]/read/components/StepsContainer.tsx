import React from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import { Path } from '../../types';

interface StepsContainerProps {
  path: Path;
  activeStepId: number;
  onStepClick: (stepId: number) => void;
  level?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function StepsContainer({
  path,
  activeStepId,
  onStepClick,
  level = 0,
  isCollapsed = false,
  onToggleCollapse,
}: StepsContainerProps) {
  const colors = useColors();
  const blocks =
    path.blocks.filter(
      (block) => block.type === 'STEP' || block.type === 'DELAY'
    ) || [];

  // Helper function to get icon path for a block
  const getIconPath = (block: any) => {
    if (block.icon) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/${block.icon}`;
    }
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
  };

  return (
    <div className="space-y-2" style={{ marginLeft: level * 16 }}>
      {/* Path header with collapse toggle */}
      <div 
        className="flex items-center gap-2 p-2 rounded-md w-full hover-bg-custom cursor-pointer"
        style={{ 
          '--hover-bg': colors['bg-secondary'],
        } as React.CSSProperties}
        onClick={onToggleCollapse}
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-icon.svg`}
          alt="Branch Icon"
          className="w-4 h-4"
        />
        <span 
          className="text-sm truncate flex-1"
          style={{ color: colors['text-secondary'] }}
        >
          {path.name}
        </span>
        {onToggleCollapse && (
          <div
            className="p-1 rounded flex-shrink-0 hover-bg-custom"
            style={{ 
              '--hover-bg': colors['bg-secondary'],
            } as React.CSSProperties}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
                isCollapsed ? 'chevron-right' : 'chevron-down'
              }.svg`}
              alt={isCollapsed ? 'Expand' : 'Collapse'}
              className="w-4 h-4"
            />
          </div>
        )}
      </div>

      {/* Blocks */}
      {!isCollapsed &&
        blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => onStepClick(block.id)}
            className={cn(
              'w-full flex items-center gap-3 p-1 px-3 rounded-md text-sm max-w-full',
              'transition-colors duration-200 ease-in-out',
              'focus:outline-none cursor-pointer',
              activeStepId === block.id ? '' : 'hover-bg-custom'
            )}
            style={{
              backgroundColor: activeStepId === block.id
                ? colors['bg-brand-solid']
                : 'transparent',
              '--hover-bg': colors['bg-secondary'],
            } as React.CSSProperties}
            role="link"
            aria-label={`Navigate to ${block.title || block.step_details} section`}
          >
            <img
              src={getIconPath(block)}
              alt="Step Icon"
              className="w-4 h-4"
              onError={(e) => {
                e.currentTarget.src = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`;
              }}
            />
            <span
              className={cn(
                'text-left text-sm truncate flex-1',
                activeStepId === block.id && 'font-medium'
              )}
              style={{
                color: activeStepId === block.id
                  ? colors['text-white']
                  : colors['text-secondary'],
              }}
            >
              {block.title ||
                block.step_details ||
                `Block`}
            </span>
          </button>
        ))}
        
      <style jsx global>{`
        .hover-bg-custom:hover {
          background-color: var(--hover-bg);
        }
      `}</style>
    </div>
  );
}