import React, { useState, useEffect, useRef } from 'react';
import { Block, BlockType } from '@/types/block';
import ImageUploader from './ImageUploader';
import IconUploader from './IconUploader'; // Import the IconUploader component

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
  const [newType, setNewType] = useState<Block['type']>(
    block?.type || BlockType.STEP
  );
  const [newDescription, setNewDescription] = useState(
    block?.description || ''
  );
  const [newImageDescription, setNewImageDescription] = useState<string>(
    block?.imageDescription || ''
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null); // Track the icon file
  const [clickPosition, setClickPosition] = useState<{
    x: number;
    y: number;
  } | null>(block?.clickPosition || null);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (block) {
      setNewType(block.type);
      setNewDescription(block.description || '');
      setNewImageDescription(block.imageDescription || '');
      setClickPosition(block?.clickPosition || null);
    }
  }, [block]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore Escape if focused on the textarea
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
        !textareaRef.current.contains(e.target as Node) // Exclude textarea
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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = (e.target as HTMLImageElement).getBoundingClientRect();
    const x = e.clientX - rect.left; // X-coordinate relative to the image
    const y = e.clientY - rect.top; // Y-coordinate relative to the image

    setClickPosition({ x, y }); // Update the single circle's position
  };

  const handleUpdate = () => {
    if (block) {
      const updatedBlock: Block = {
        ...block,
        type: newType as Block['type'],
        description: newDescription,
        imageDescription: newImageDescription,
        clickPosition,
      };
      onUpdate(updatedBlock, imageFile || undefined, iconFile || undefined); // Pass iconFile
      onClose();
    }
  };

  const handleDelete = () => {
    if (block) {
      onDelete(block.id);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center">
        {block && block.image && (
          <div className="relative">
            <img
              ref={imageRef}
              src={block.image}
              alt="Overlay"
              className="max-h-full max-w-full object-contain"
              onClick={handleImageClick}
            />
            {/* Render the circle at the current click position */}
            {clickPosition && (
              <div
                className="absolute bg-blue-500 bg-opacity-50 rounded-full"
                style={{
                  width: '50px',
                  height: '50px',
                  left: `${clickPosition.x - 25}px`,
                  top: `${clickPosition.y - 25}px`,
                  pointerEvents: 'none',
                }}
              ></div>
            )}
            {/* Image Description Textarea */}
            <textarea
              ref={textareaRef}
              value={newImageDescription || ''} // Ensure it's a valid string
              onChange={(e) => setNewImageDescription(e.target.value)}
              placeholder="Enter image description"
              className="w-full mt-2 p-2 border rounded"
            />
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 bottom-0 bg-gray-100 p-4 w-64 border-l z-40"
      >
        {block ? (
          <>
            <button onClick={onClose} className="text-red-500 mb-4">
              Close
            </button>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as Block['type'])}
                className="border rounded p-1 w-full"
              >
                <option value="DELAY">DELAY</option>
                <option value="STEP">STEP</option>
                <option value="PATH">PATH</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="border rounded p-1 w-full"
              />
            </div>
            <ImageUploader
              onImageUpload={setImageFile}
              initialImageUrl={block?.image || ''}
            />
            <IconUploader
              onIconUpload={setIconFile} // Handle icon file
              initialIconUrl={block?.icon || ''} // Display existing icon if any
            />
            <button
              onClick={handleUpdate}
              className="bg-blue-500 text-white py-2 px-4 rounded mb-2"
            >
              Update
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white py-2 px-4 rounded"
            >
              Delete
            </button>
          </>
        ) : (
          <p>Select a block to see details</p>
        )}
      </div>
    </>
  );
}
