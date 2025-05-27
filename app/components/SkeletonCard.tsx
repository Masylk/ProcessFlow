'use client';

import React from 'react';
import { useColors } from '@/app/theme/hooks';

const SkeletonCard: React.FC = () => {
  const colors = useColors();

  return (
    <div 
      style={{ 
        backgroundColor: colors['bg-primary'],
        borderColor: colors['border-primary']
      }}
      className="rounded-xl border p-4 animate-pulse"
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

      {/* Description skeleton */}
      <div 
        style={{ backgroundColor: colors['bg-secondary'] }}
        className="h-4 rounded mb-1 w-full"
      />
      <div 
        style={{ backgroundColor: colors['bg-secondary'] }}
        className="h-4 rounded mb-4 w-2/3"
      />

      {/* Tags skeleton */}
      <div className="flex gap-2 mb-4">
        <div 
          style={{ backgroundColor: colors['bg-secondary'] }}
          className="h-6 rounded-full w-16"
        />
        <div 
          style={{ backgroundColor: colors['bg-secondary'] }}
          className="h-6 rounded-full w-20"
        />
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <div 
          style={{ backgroundColor: colors['bg-secondary'] }}
          className="h-4 rounded w-20"
        />
        <div 
          style={{ backgroundColor: colors['bg-secondary'] }}
          className="h-4 rounded w-16"
        />
      </div>
    </div>
  );
};

export default SkeletonCard;