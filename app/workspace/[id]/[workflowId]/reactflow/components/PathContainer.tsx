import React from 'react';
import { Path } from '../types';

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
  return (
    <div
      className="relative"
      style={{
        marginLeft: level * 18, // 24px indent for each level
      }}
    >
      <div className="absolute left-3 top-10 bottom-2 border-l border-gray-200" />
      {/* Path Content */}
      <div className="py-2">{renderContent(path, level)}</div>
    </div>
  );
};
