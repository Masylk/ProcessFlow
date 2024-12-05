import React, { useState, useEffect, useRef } from 'react';
import { Block, BlockType } from '@/types/block';
import ImageUploader from './ImageUploader';
import IconUploader from './IconUploader';
import TextEditor from './TextEditor';
import BlockMediaVisualizer from './BlockMediaVisualizer';
import MediaUploader from './MediaUploader';
import BlockInformations from './BlockInformations';

interface BlockDetailsSidebarProps {
  block: Block | null;
  onClose: () => void;
  onUpdate: (updatedBlock: Block, imageFile?: File, iconFile?: File) => void;
  onDelete: (blockId: number) => void;
}

export default function BlockDetailsSidebar({
  block,
  onClose,
  onUpdate,
  onDelete,
}: BlockDetailsSidebarProps) {
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [iconFile, setIconFile] = useState<File | undefined>(undefined); // Track the icon file

  const [updateBlock, setUpdateBlock] = useState<Block | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (block) {
      setUpdateBlock(block);
    }
  }, [block]); // This ensures the updateBlock state will change when the block prop changes

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        document.activeElement !== textareaRef.current
      ) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        imageRef.current &&
        textareaRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        !imageRef.current.contains(e.target as Node) &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleUpdate = (
    updatedBlock: Block,
    imageFile?: File,
    iconFile?: File
  ) => {
    if (block) {
      // Use a callback to ensure you're updating based on the previous state
      setUpdateBlock((prevBlock) => {
        const newBlock = { ...prevBlock, ...updatedBlock };
        // You can further modify the block if needed before returning
        return newBlock;
      });
      onUpdate(updatedBlock, imageFile || undefined, iconFile || undefined);
    }
  };

  const handleDelete = () => {
    if (block) {
      onDelete(block.id);
      onClose();
    }
  };

  return (
    <div
      className="overflow-hidden absolute top-[-3vh] right-6 h-[94vh] w-[540px] bg-white shadow-lg p-6 border-l border-[#e4e7ec] z-20 flex flex-col"
      ref={sidebarRef}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 left-6 h-7 w-7 p-1 bg-white rounded-lg border border-[#d0d5dd] inline-flex items-center justify-center gap-2"
      >
        <img
          src="/assets/shared_components/close-drawer.svg"
          alt="Close"
          className="w-4 h-4"
        />
      </button>

      {/* Container for the buttons to be aligned to the far right */}
      <div className="absolute top-4 right-4 flex gap-2">
        {/* Link Button */}
        <button
          onClick={() => console.log('Link button clicked')} // Placeholder action
          className="h-7 w-7 p-1 bg-white rounded-lg border border-[#d0d5dd] inline-flex items-center justify-center gap-2"
        >
          <img
            src="/assets/shared_components/link-icon.svg"
            alt="Link"
            className="w-4 h-4"
          />
        </button>

        {/* Message Button */}
        <button
          onClick={() => console.log('Message button clicked')} // Placeholder action
          className="h-7 w-7 p-1 bg-white rounded-lg border border-[#d0d5dd] inline-flex items-center justify-center gap-2"
        >
          <img
            src="/assets/shared_components/message-icon.svg"
            alt="Message"
            className="w-4 h-4"
          />
        </button>
      </div>

      {updateBlock && (
        <>
          {/* Information Section */}
          <BlockInformations
            block={updateBlock}
            onUpdate={(updatedFields) => {
              if (updateBlock) {
                const updatedBlock = { ...updateBlock, ...updatedFields };
                handleUpdate(updatedBlock, imageFile, iconFile);
              }
            }}
          />

          {/* Description Section */}
          <div className="mt-0">
            <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight mb-3">
              Description
            </div>
            {/* <TextEditor value={newDescription} onChange={setNewDescription} /> */}
          </div>

          {/* Media Section */}
          <div className="flex flex-col justify-start mt-2 h-[126px]">
            <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight mb-2">
              Media
            </div>

            {updateBlock.image ? (
              <BlockMediaVisualizer
                mediaSrc={updateBlock.image}
                altText="Block Media"
                // onMediaClick={handleImageClick}
              />
            ) : (
              <MediaUploader
                onUpload={(file) => {
                  setImageFile(file);
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
