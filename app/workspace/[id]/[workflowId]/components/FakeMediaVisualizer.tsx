import React from 'react';

interface FakeMediaVisualizerProps {
  imageFile: File;
  altText: string;
  handleDelete: () => void;
}

export default function FakeMediaVisualizer({
  imageFile,
  altText,
}: FakeMediaVisualizerProps) {
  const objectUrl = URL.createObjectURL(imageFile);

  return (
    <img
      className="self-stretch h-[267px] rounded-xl border border-[#e4e7ec]"
      src={objectUrl}
      alt={altText}
      onLoad={() => URL.revokeObjectURL(objectUrl)} // Clean up object URL when no longer needed
    />
  );
}
