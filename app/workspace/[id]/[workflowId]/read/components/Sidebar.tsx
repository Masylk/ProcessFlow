import React, { useMemo, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Workspace } from '@/types/workspace';
import { useColors } from '@/app/theme/hooks';
import { usePathsStore } from '../../store/pathsStore';
import StepsContainer from './StepsContainer';
import { organizePaths } from '../../utils/pathUtils';
import { Path } from '../../reactflow/types';

interface SidebarProps {
  className?: string;
  workspace: Workspace;
  activeStepId: number;
  onStepClick: (stepId: number) => void;
}

export default function Sidebar({
  className,
  workspace,
  activeStepId,
  onStepClick,
}: SidebarProps) {
  const colors = useColors();
  const originalPaths = usePathsStore((state) => state.paths);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [collapsedPaths, setCollapsedPaths] = useState<Set<number>>(new Set());

  // Deep clone paths before organizing
  const clonedPaths = useMemo(
    () =>
      originalPaths.map((path) => ({
        ...path,
        blocks: path.blocks.map((block) => ({
          ...block,
          child_paths: block.child_paths
            ? block.child_paths.map((cp) => ({
                ...cp,
                path: { ...cp.path },
                block: { ...cp.block },
              }))
            : [],
          path: { ...path },
        })),
        parent_blocks: path.parent_blocks.map((pb) => ({
          ...pb,
          block: { ...pb.block },
        })),
      })),
    [originalPaths]
  );

  // Use the shared path organization logic
  const { paths, mainPaths } = useMemo(
    () => organizePaths(clonedPaths || []),
    [clonedPaths]
  );

  const renderPathContent = (path: Path, level: number = 0) => {
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
            .filter((block) => block.type !== 'LAST')
            .map((block) => {
              if (block.type === 'PATH' && block.child_paths) {
                return block.child_paths.map((childPathConnection) => {
                  const childPath = paths?.find(
                    (p) => p.id === childPathConnection.path.id
                  );
                  if (childPath) {
                    return renderPathContent(childPath, level + 1);
                  }
                  return null;
                });
              }
              return null;
            })}
      </div>
    );
  };

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
        <div className="self-stretch px-3 py-2.5 rounded-md flex items-center gap-2">
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

      {/* Steps count */}
      <div className="px-7 py-4">
        <span
          className="text-xs font-normal"
          style={{ color: colors['text-secondary'] }}
        >
          {mainPaths[0]?.blocks.length || 0} Steps
        </span>
      </div>

      {/* Steps list */}
      <div className="flex-1 overflow-y-auto px-4">
        {mainPaths.map((path) => renderPathContent(path, 0))}
      </div>
    </div>
  );
}
