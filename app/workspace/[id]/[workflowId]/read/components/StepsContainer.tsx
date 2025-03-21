import React from 'react';
import { cn } from '@/lib/utils';
import { useColors } from '@/app/theme/hooks';
import { Path } from '../../reactflow/types';

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

  return (
    <div className="space-y-2" style={{ marginLeft: level * 16 }}>
      {/* Path header with collapse toggle */}
      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md">
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/git-branch-icon.svg`}
          alt="Branch Icon"
          className="w-6 h-6"
        />
        <span className="text-sm text-gray-700">{path.name}</span>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/${
                isCollapsed ? 'chevron-right' : 'chevron-down'
              }.svg`}
              alt={isCollapsed ? 'Expand' : 'Collapse'}
              className="w-4 h-4"
            />
          </button>
        )}
      </div>

      {/* Blocks */}
      {!isCollapsed &&
        blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => onStepClick(block.position)}
            className={cn(
              'w-full flex items-center gap-3 p-1 rounded-lg text-sm',
              'transition-colors duration-200 ease-in-out',
              'focus:outline-none cursor-pointer',
              activeStepId === block.position 
                ? 'bg-brand-solid text-white' 
                : 'bg-transparent hover:bg-secondary'
            )}
            style={{
              backgroundColor: activeStepId === block.position 
                ? colors['bg-brand-solid']
                : 'transparent'
            }}
            role="link"
            aria-label={`Navigate to ${block.title || block.step_details} section`}
          >
            <div
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-sm font-medium"
              style={{
                color:
                  activeStepId === block.position
                    ? colors['text-white']
                    : colors['text-secondary'],
              }}
            >
              {block.position}
            </div>
            <span
              className={cn(
                'text-left text-sm truncate flex-1',
                activeStepId === block.position && 'font-medium'
              )}
              style={{
                color:
                  activeStepId === block.position
                    ? colors['text-white']
                    : colors['text-secondary'],
              }}
            >
              {block.title ||
                block.step_details ||
                `Block ${block.position + 1}`}
            </span>
          </button>
        ))}
      <style jsx>{`
        .step-hover:hover {
          background-color: ${colors['bg-secondary']};
        }
      `}</style>
    </div>
  );
}
