import React from 'react';
import { useColors } from '@/app/theme/hooks';

interface ProcessCanvasProps {
  children: React.ReactNode;
}

export default function ProcessCanvas({ children }: ProcessCanvasProps) {
  const colors = useColors();
  
  return (
    <div className="relative w-[calc(100vw-256px)] h-[calc(100vh-112px)]">
      <div 
        className="h-screen pt-28 pb-16 overflow-auto scrollbar-none hover:scrollbar-default"
        style={{ backgroundColor: colors['bg-primary'] }}
      >
        {children}
      </div>
    </div>
  );
} 