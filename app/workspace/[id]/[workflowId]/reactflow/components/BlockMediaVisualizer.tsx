import { Block } from '../../types';
import React, { useEffect, useState } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import ImageEditor from './ImageEditor';

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
  const [isEditing, setIsEditing] = useState(false);

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

  const handleResetImage = () => {
    if (block.original_image) {
      onUpdate({ image: block.original_image, original_image: '' });
    }
  };

  const handleSaveEdit = async (editedImageUrl: string) => {
    // This will be implemented later with actual image editing functionality
    setIsEditing(false);
    onUpdate({
      image: editedImageUrl,
      original_image: block.original_image ? block.original_image : block.image,
    });
  };

  if (!signedImageUrl) return null;

  return (
    <>
      <div className="relative w-full h-[267px]">
        <img
          className="w-full h-full object-cover rounded-xl"
          src={signedImageUrl}
          alt={altText}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {block.original_image && (
            <ButtonNormal
              onClick={handleResetImage}
              size="small"
              variant="secondary"
              aria-label="Reset to Original Image"
            >
              Reset Edition
            </ButtonNormal>
          )}
          <ButtonNormal
            onClick={() => setIsEditing(true)}
            size="small"
            variant="secondary"
            iconOnly
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-icon.svg`}
            aria-label="Edit Image"
          />
          <ButtonNormal
            onClick={handleRemoveImage}
            size="small"
            variant="secondary"
            iconOnly
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
            aria-label="Remove Image"
          />
        </div>
      </div>

      {isEditing && signedImageUrl && (
        <ImageEditor
          imageUrl={signedImageUrl}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
