'use client';

import React from 'react';
import { useColors } from '@/app/theme/hooks';

const SkeletonWorkflowCard: React.FC = () => {
  const colors = useColors();

  return (
    <div 
      style={{ 
        backgroundColor: colors['bg-primary'],
        borderColor: colors['border-primary']
      }}
      className="rounded-lg border p-4 animate-pulse h-[200px] flex flex-col transition-all duration-300 ease-in-out"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-3">
        <div 
          style={{ backgroundColor: colors['bg-secondary'] }}
          className="w-8 h-8 rounded-lg"
        />
        <div 
          style={{ backgroundColor: colors['bg-secondary'] }}
          className="w-5 h-5 rounded"
        />
      </div>

      {/* Title skeleton */}
      <div 
        style={{ backgroundColor: colors['bg-secondary'] }}
        className="h-5 rounded mb-2 w-3/4"
      />

      {/* Process owner and review date skeleton */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <div 
            style={{ backgroundColor: colors['bg-secondary'] }}
            className="w-4 h-4 rounded"
          />
          <div 
            style={{ backgroundColor: colors['bg-secondary'] }}
            className="h-3 rounded w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <div 
            style={{ backgroundColor: colors['bg-secondary'] }}
            className="w-4 h-4 rounded"
          />
          <div 
            style={{ backgroundColor: colors['bg-secondary'] }}
            className="h-3 rounded w-28"
          />
        </div>
      </div>

      {/* Bottom section skeleton */}
      <div className="mt-auto">
        <div
          style={{ borderColor: colors['border-secondary'] }}
          className="border-t w-full mb-3"
        />
        <div className="flex items-center justify-between">
          <div 
            style={{ backgroundColor: colors['bg-secondary'] }}
            className="h-5 rounded-full w-16"
          />
          <div 
            style={{ backgroundColor: colors['bg-secondary'] }}
            className="h-3 rounded w-20"
          />
        </div>
      </div>
    </div>
  );
};

export default SkeletonWorkflowCard;