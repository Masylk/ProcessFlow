import React, { useState, useEffect, useRef } from 'react';
import BlockOptions from './BlockOptions';
import { Block } from '@/types/block';

interface BlockOptionsToggleProps {
  block: Block;
  handleAddBlockFn: (
    blockData: any,
    pathId: number,
    position: number
  ) => Promise<Block | null>;
  handleDeleteBlockFn: (blockId: number) => Promise<void>;
  copyBlockFn: (blockData: Block) => void;
}

const BlockOptionsToggle: React.FC<BlockOptionsToggleProps> = ({
  block,
  handleAddBlockFn,
  handleDeleteBlockFn,
  copyBlockFn,
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
    setIsOpen(false);
  };

  const handleCopy = () => {
    copyBlockFn(block);
    setIsOpen(false);
  };

  const handleCopyLink = () => {
    setIsOpen(false);
  };

  const handleDuplicate = () => {
    if (block.pathId) {
      handleAddBlockFn(block, block.pathId, block.position);
    }
    setIsOpen(false);
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
            top: '100%', // Adjust dropdown position as before (top-full)
            left: '0', // Align left
            overflow: 'visible', // Ensure overflow is visible and dropdown isn't clipped
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
