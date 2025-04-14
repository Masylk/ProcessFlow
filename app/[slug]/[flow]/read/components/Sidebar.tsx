import React, { useMemo, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Workspace } from '@/types/workspace';
import { useColors } from '@/app/theme/hooks';
import { usePathsStore } from '../store/pathsStore';
import StepsContainer from './StepsContainer';
import { Path } from '../../types';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  className?: string;
  workspace: Workspace;
  activeStepId: number;
  onStepClick: (stepId: number) => void;
  pathsToDisplay: Path[];
}

export default function Sidebar({
  className,
  workspace,
  activeStepId,
  onStepClick,
  pathsToDisplay,
}: SidebarProps) {
  const colors = useColors();
  const router = useRouter();
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<number>>(new Set());

  const renderPathContent = (
    path: Path,
    level: number = 0,
    renderedPaths: Set<number> = new Set()
  ) => {
    // Add current path to rendered set
    renderedPaths.add(path.id);
    const isPathCollapsed = collapsedPaths.has(path.id);

    return (
      <div key={path.id}>
        <StepsContainer
          path={path}
          activeStepId={activeStepId}
          onStepClick={onStepClick}
          level={level}
          isCollapsed={isPathCollapsed}
          onToggleCollapse={() => {
            setCollapsedPaths((prev) => {
              const newSet = new Set(prev);
              if (isPathCollapsed) {
                newSet.delete(path.id);
              } else {
                newSet.add(path.id);
              }
              return newSet;
            });
          }}
        />

        {!isPathCollapsed &&
          path.blocks
            .filter((block) => block.type !== 'LAST' && block.type !== 'BEGIN')
            .map((block) => {
              if (
                block.type === 'MERGE' ||
                block.type === 'PATH' ||
                block.type === 'STEP'
              ) {
                return block.child_paths?.map((childPathConnection) => {
                  // Skip if we've already rendered this path
                  if (renderedPaths.has(childPathConnection.path.id)) {
                    return null;
                  }

                  const childPath = pathsToDisplay.find(
                    (p) => p.id === childPathConnection.path.id
                  );
                  if (childPath) {
                    return (
                      <div key={`${childPath.id}-${block.id}`}>
                        {renderPathContent(
                          childPath,
                          block.type === 'MERGE'
                            ? Math.max(level - 2, 0)
                            : Math.max(level, 0) + 1,
                          renderedPaths
                        )}
                      </div>
                    );
                  }
                  return null;
                });
              }
              return null;
            })}
      </div>
    );
  };

  const mainPath = pathsToDisplay.find(
    (path) => path.parent_blocks.length === 0
  );

  return (
    <div
      className={cn(
        'w-64 h-full flex flex-col fixed left-0 top-0 border-r',
        className
      )}
      style={{
        backgroundColor: colors['bg-primary'],
        borderColor: colors['border-secondary'],
      }}
    >
      {/* Workspace Header */}
      <div className="w-full px-3 py-1 flex-col justify-start items-start inline-flex">
        <div 
          className="self-stretch px-3 py-2.5 rounded-md flex items-center gap-2 cursor-pointer hover:bg-opacity-80"
          onClick={() => router.push(`/dashboard/`)}
          role="button"
          aria-label="Go to workspace dashboard"
        >
          <div className="relative w-8 h-8">
            {workspace.icon_url && (
              <img
                src={workspace.icon_url}
                alt={workspace.name}
                className="w-8 h-8 rounded-lg object-cover absolute inset-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-medium absolute inset-0"
              style={{
                backgroundColor:
                  workspace.background_colour || colors['bg-brand-primary'],
                display: 'flex',
                opacity: workspace.icon_url ? 0 : 1,
              }}
            >
              {workspace.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="relative flex flex-col px-0.5 min-w-0 flex-1">
            <div
              className="text-sm font-medium font-['Inter'] leading-tight truncate"
              style={{ color: colors['text-primary'] }}
            >
              {workspace.name}
            </div>
          </div>
        </div>
      </div>

      

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto px-5">
        {mainPath && renderPathContent(mainPath, 0)}
      </div>
    </div>
  );
}
