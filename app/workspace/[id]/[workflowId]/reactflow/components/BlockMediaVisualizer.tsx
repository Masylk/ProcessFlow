import { Block } from '../types';
import React, { useEffect, useState } from 'react';

interface BlockMediaVisualizerProps {
  block: Block;
  altText: string;
  onUpdate: (updatedBlock: Partial<Block>) => void;
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
          }
        } catch (error) {
          console.error('Error fetching signed URL:', error);
        }
      }
    };

    fetchSignedUrl();
  }, [block.image]);

  const handleRemoveImage = async () => {
    try {
      // First delete the image
      const response = await fetch(`/api/blocks/${block.id}/image`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Then update the block state
      onUpdate({ image: '' });
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  if (!signedImageUrl) return null;

  return (
    <div className="relative w-full h-[267px]">
      <img
        className="w-full h-full object-cover rounded-xl"
        src={signedImageUrl}
        alt={altText}
      />
      <div
        className="absolute top-2 right-2 h-9 p-2 bg-white rounded-lg shadow border border-[#d0d5dd] flex justify-center items-center cursor-pointer"
        onClick={handleRemoveImage}
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
          alt="Trash Icon"
          className="w-5 h-5"
        />
      </div>
    </div>
  );
}
