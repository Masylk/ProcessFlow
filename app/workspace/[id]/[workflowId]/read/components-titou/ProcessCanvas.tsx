import React from 'react';

interface ProcessCanvasProps {
  children: React.ReactNode;
}

export default function ProcessCanvas({ children }: ProcessCanvasProps) {
  return (
    <div className="relative w-[calc(100vw-256px)] h-[calc(100vh-112px)] mt-28">
      <div className="h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 