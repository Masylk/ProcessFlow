import React from 'react';
import { Path } from '../types';
import { useColors } from '@/app/theme/hooks';

interface PathContainerProps {
  path: Path;
  level: number;
  renderContent: (path: Path, level: number) => React.ReactNode;
}

export const PathContainer: React.FC<PathContainerProps> = ({
  path,
  level,
  renderContent,
}) => {
  const colors = useColors();
  
  return (
    <div
      className="relative"
      style={{
        marginLeft: level * 18, // 24px indent for each level
      }}
    >
      <div 
        className="absolute left-3 top-10 bottom-2 border-l" 
        style={{ 
          borderColor: colors['border-primary'],
          opacity: 0.8,
        }}
      />
      {/* Path Content */}
      <div className="py-2">{renderContent(path, level)}</div>
    </div>
  );
};
