import React from 'react';
import { useColors } from '@/app/theme/hooks';
import { cn } from '@/lib/utils';

interface ProcessCanvasProps {
  children: React.ReactNode;
  className?: string;
}

export default function ProcessCanvas({ children, className }: ProcessCanvasProps) {
  const colors = useColors();
  
  return (
    <div
      className={cn(
        "relative pt-[120px] pb-6",
        className?.includes("absolute") ? "" : className?.includes("overflow-hidden") ? "h-screen" : "min-h-screen",
        className
      )}
      style={{ backgroundColor: colors['bg-secondary'] }}
    >
      {children}
    </div>
  );
} 