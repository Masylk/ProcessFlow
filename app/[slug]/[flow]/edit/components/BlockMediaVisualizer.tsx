import { Block } from '../../types';
import React, { useEffect, useState } from 'react';
import ButtonNormal from '@/app/components/ButtonNormal';
import ImageEditor from './ImageEditor';
import { useColors } from '@/app/theme/hooks';
import { createPortal } from 'react-dom';

interface BlockMediaVisualizerProps {
  block: Block;
  altText: string;
  signedImageUrl?: string | null;
  onUpdate: (updatedBlock: Partial<Block>) => void;
}

export default function BlockMediaVisualizer({
  block,
  altText,
  signedImageUrl,
  onUpdate,
}: BlockMediaVisualizerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const colors = useColors();

  const handleRemoveImage = async () => {
    // Save previous image for rollback
    const previousImage = block.image;
    // Optimistically update UI
    onUpdate({ image: '' });
    try {
      // Delete the image on the server
      const response = await fetch(`/api/blocks/${block.id}/image`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
    } catch (error) {
      // Rollback if error
      onUpdate({ image: previousImage });
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
      <div
        className="relative w-full h-[267px] rounded-xl overflow-hidden"
        style={{ backgroundColor: colors['bg-secondary'] }}
      >
        <img
          className="w-full h-full object-contain rounded-xl"
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
              className="h-8 min-w-[100px]"
            >
              Reset Original
            </ButtonNormal>
          )}
          <ButtonNormal
            onClick={() => setIsEditing(true)}
            size="small"
            variant="secondary"
            iconOnly
            className="h-8 w-8"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/edit-icon.svg`}
            aria-label="Edit Image"
          />
          <ButtonNormal
            onClick={handleRemoveImage}
            size="small"
            variant="secondary"
            iconOnly
            className="h-8 w-8"
            leadingIcon={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/trash-icon.svg`}
            aria-label="Remove Image"
          />
        </div>
      </div>

      {isEditing && signedImageUrl && (
        createPortal(
          <ImageEditor
            imageUrl={signedImageUrl}
            onClose={() => setIsEditing(false)}
            onSave={handleSaveEdit}
          />,
          document.body
        )
      )}
    </>
  );
}
