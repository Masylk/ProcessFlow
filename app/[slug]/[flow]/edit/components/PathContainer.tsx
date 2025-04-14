import React from 'react';
import { Path } from '../../types';
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
    <div className="w-full">
      {renderContent(path, level)}
    </div>
  );
};
