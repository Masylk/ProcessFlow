import { Block } from '@/types/block';
import React from 'react';

interface BlockMediaVisualizerProps {
  block: Block;
  altText: string;
  onUpdate: (updatedBlock: Block, imageFile?: File, iconFile?: File) => void;
}

export default function BlockMediaVisualizer({
  block,
  altText,
  onUpdate,
}: BlockMediaVisualizerProps) {
  const handleRemoveImage = () => {
    const updatedBlock = { ...block, image: '' };
    onUpdate(updatedBlock); // Call onUpdate with the updated block
  };

  if (!block.image) return null;

  return (
    <div className="relative w-full h-[267px]">
      {/* Image */}
      <img
        className="w-full h-full object-cover rounded-xl"
        src={block.image}
        alt={altText}
      />
      {/* Trash Icon */}
      <div
        className="absolute top-2 right-2 h-9 p-2 bg-white rounded-lg shadow border border-[#d0d5dd] flex justify-center items-center cursor-pointer"
        onClick={handleRemoveImage} // Attach the click handler here
      >
        <img
          src="/assets/shared_components/trash-icon.svg"
          alt="Trash Icon"
          className="w-5 h-5"
        />
      </div>
    </div>
  );
}
