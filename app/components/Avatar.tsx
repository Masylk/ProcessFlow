import React from 'react';

interface AvatarProps {
  url: string;
  index: number; // Index will determine the position of each avatar
}

const Avatar: React.FC<AvatarProps> = ({ url, index }) => {
  return (
    <div
      className="w-6 h-6 rounded-full border border-white justify-center items-center flex absolute"
      style={{ left: `${index * 17}px` }} // Reduce the overlap to 2px for less overlap
    >
      <div className="w-6 h-6 relative rounded-full border border-black/10">
        <img
          src={url}
          alt={`Avatar ${index}`}
          className="w-full h-full rounded-full"
        />
      </div>
    </div>
  );
};

export default Avatar;
