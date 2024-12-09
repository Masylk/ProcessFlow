import { Block } from '@/types/block';
import React from 'react';

interface BlockMediaVisualizerProps {
  mediaSrc: string | null;
  altText: string;
  onUpdate: (updatedBlock: Block, imageFile?: File, iconFile?: File) => void;
}

export default function BlockMediaVisualizer({
  mediaSrc,
  altText,
}: BlockMediaVisualizerProps) {
  if (!mediaSrc) return null;

  return (
    <div className="relative w-full h-[267px]">
      {/* Image */}
      <img
        className="w-full h-full object-cover rounded-xl"
        src={mediaSrc}
        alt={altText}
      />
      {/* Trash Icon */}
      <div className="absolute top-2 right-2 h-9 p-2 bg-white rounded-lg shadow shadow-inner border border-[#d0d5dd] flex justify-center items-center cursor-pointer">
        <img
          src="/assets/shared_components/trash-icon.svg"
          alt="Trash Icon"
          className="w-5 h-5"
        />
      </div>
    </div>
  );
}
