import React, { useState, useEffect } from 'react';
import { Block } from '@/types/block';
import BlockOptionsToggle from './BlockOptionsToggle';

interface EditorBlockProps {
  id: string;
  block: Block;
  onClick: (block: Block, event: React.MouseEvent) => void;
  handleAddBlockFn: (
    blockData: any,
    pathId: number,
    position: number
  ) => Promise<void>;
  handleDeleteBlockFn: (blockId: number) => Promise<void>;
  copyBlockFn: (blockdata: Block) => void;
}

const ImageOverlay = ({
  src,
  onClose,
}: {
  src: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Full screen"
        className="max-w-2/3 max-h-2/3 object-cover rounded shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking on the image
      />
    </div>
  );
};

export default function EditorBlock({
  id,
  block,
  onClick,
  handleAddBlockFn,
  handleDeleteBlockFn,
  copyBlockFn,
}: EditorBlockProps) {
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  const handleClick = (event: React.MouseEvent) => {
    // event.stopPropagation();
    onClick(block, event);
  };

  const handleImageClick = (event: React.MouseEvent) => {
    // event.stopPropagation();
    console.log('clicked on image');
    setOverlayVisible(true);
  };

  return (
    <div
      id={id}
      className="relative border border-black bg-white p-4 m-4 rounded w-80 cursor-pointer"
      onClick={handleClick}
    >
      <div className="absolute top-2 right-2">
        <BlockOptionsToggle
          block={block}
          handleAddBlockFn={handleAddBlockFn}
          handleDeleteBlockFn={handleDeleteBlockFn}
          copyBlockFn={copyBlockFn}
        />
      </div>

      <div className="flex-1 w-full">
        <h3 className="text-lg font-bold">{block.type}</h3>

        {block.icon && <img src={block.icon} alt="icon" className="my-2" />}

        {block.description && <p className="text-sm">{block.description}</p>}

        {block.image && (
          <img
            src={block.image}
            alt="block image"
            className="my-2 w-full h-auto object-cover rounded cursor-pointer"
            onClick={handleImageClick}
          />
        )}
      </div>

      {isOverlayVisible && block.image && (
        <ImageOverlay
          src={block.image}
          onClose={() => setOverlayVisible(false)}
        />
      )}
    </div>
  );
}
