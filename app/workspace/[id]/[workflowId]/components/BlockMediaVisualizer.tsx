import { Block } from '@/types/block';
import React, { useEffect, useState } from 'react';

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
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (block.image) {
        try {
          const response = await fetch(
            `/api/get-signed-url?path=${block.image}`
          );
          const data = await response.json();

          if (response.ok && data.signedUrl) {
            setSignedImageUrl(data.signedUrl);
          } else {
            console.error('Error fetching signed URL:', data.error);
            setSignedImageUrl(null);
          }
        } catch (err) {
          console.error('Unexpected error fetching signed URL:', err);
          setSignedImageUrl(null);
        }
      }
    };

    fetchSignedUrl();
  }, [block.image]);

  const handleRemoveImage = () => {
    const updatedBlock = { ...block, image: '' };
    onUpdate(updatedBlock); // Call onUpdate with the updated block
  };

  if (!signedImageUrl) return null;

  return (
    <div className="relative w-full h-[267px]">
      {/* Image */}
      <img
        className="w-full h-full object-cover rounded-xl"
        src={signedImageUrl}
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
