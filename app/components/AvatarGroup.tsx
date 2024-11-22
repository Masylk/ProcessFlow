import React from 'react';
import Avatar from './Avatar';

interface AvatarGroupProps {
  urls: string[];
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ urls }) => {
  return (
    <div className="relative w-20 h-6 flex items-center justify-start gap-1.5">
      {urls.map((url, index) => (
        <Avatar key={index} url={url} index={index} />
      ))}
    </div>
  );
};

export default AvatarGroup;
