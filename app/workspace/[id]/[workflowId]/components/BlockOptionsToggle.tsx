import React, { useState, useEffect, useRef } from 'react';
import BlockOptions from './BlockOptions';
import { Block } from '@/types/block';
import { createClient } from '@/utils/supabase/client';
import { fetchSignedUrl } from '@/utils/supabase/fetch_url';

interface BlockOptionsToggleProps {
  block: Block;
  handleAddBlockFn: (
    blockData: any,
    pathId: number,
    position: number
  ) => Promise<Block | null>;
  handleUpdateBlockFn: (
    updatedBlock: Block,
    imageFile?: File,
    iconFile?: File
  ) => Promise<void>;
  handleDeleteBlockFn: (blockId: number) => Promise<void>;
  copyBlockFn: (blockData: Block) => void;
  image: string | null;
}

const supabase = createClient();

const BlockOptionsToggle: React.FC<BlockOptionsToggleProps> = ({
  block,
  handleAddBlockFn,
  handleUpdateBlockFn,
  handleDeleteBlockFn,
  copyBlockFn,
  image,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toggleRef.current &&
        !toggleRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = async () => {
    await handleDeleteBlockFn(block.id);
    if (block.image && block.icon) {
      // await handleUpdateBlockFn(block, block.image, block.icon);
    }
    setIsOpen(false);
  };

  const handleCopy = () => {
    copyBlockFn(block);
    setIsOpen(false);
  };

  const handleCopyLink = () => {
    setIsOpen(false);
  };

  const handleDuplicate = async () => {
    if (block.pathId) {
      // Create a new block with the updated image URL

      console.log('position duplicate block at : ' + block.position);
      // Add the new block with the duplicated image
      const clone_block = await handleAddBlockFn(
        block,
        block.pathId,
        block.position
      );

      // Check if block has an image, then duplicate it
      if (block.image) {
        // Fetch the signed URL for the original image
        const signedUrl = await fetchSignedUrl(block.image);

        if (!signedUrl) {
          throw new Error('Failed to fetch signed URL for the original image');
        }

        // Fetch the original image file using the signed URL
        const response = await fetch(signedUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch the original image');
        }

        const fileBlob = await response.blob();

        // Create a File object from the Blob with a default name
        const file = new File([fileBlob], `duplicate_${block.image}`, {
          type: fileBlob.type,
        });
        if (clone_block) await handleUpdateBlockFn(clone_block, file);
      }

      setIsOpen(false);
    }
  };

  return (
    <div ref={toggleRef} className="relative">
      {/* Dots Horizontal Button */}
      <div
        className="w-8 h-8 flex justify-center items-center cursor-pointer"
        onClick={handleToggleClick}
      >
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/dots-horizontal.svg`}
          alt="Options"
          className="w-6 h-6"
        />
      </div>

      {/* Block Options Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50"
          style={{
            top: '100%',
            left: '0',
            overflow: 'visible',
          }}
        >
          <BlockOptions
            onDelete={handleDelete}
            onCopy={handleCopy}
            onCopyLink={handleCopyLink}
            onDuplicate={handleDuplicate}
          />
        </div>
      )}
    </div>
  );
};

export default BlockOptionsToggle;
