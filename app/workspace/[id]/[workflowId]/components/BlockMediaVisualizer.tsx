import React from 'react';

interface BlockMediaVisualizerProps {
  mediaSrc: string | null;
  altText: string;
  onMediaClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}

export default function BlockMediaVisualizer({
  mediaSrc,
  altText,
  onMediaClick,
}: BlockMediaVisualizerProps) {
  if (!mediaSrc) return null;

  return (
    <img
      className="self-stretch h-[267px] rounded-xl border border-[#e4e7ec]"
      src={mediaSrc}
      alt={altText}
      onClick={onMediaClick}
    />
  );
}
