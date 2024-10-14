import { useState, useEffect, useRef } from 'react';
import BlockOptions from './BlockOptions';
import { Block } from '@/types/block';

interface BlockOptionsToggleProps {
  block: Block; // New prop for the block
  handleAddBlockFn: (blockData: any, pathId: number, position: number) => void;
  handleDeleteBlockFn: (blockId: number) => void;
}

const BlockOptionsToggle: React.FC<BlockOptionsToggleProps> = ({
  block,
  handleAddBlockFn,
  handleDeleteBlockFn,
}) => {
  const [isBlack, setIsBlack] = useState(false);
  const toggleRef = useRef<HTMLDivElement>(null);

  const handleToggleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsBlack(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toggleRef.current &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        setIsBlack(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = () => {
    handleDeleteBlockFn(block.id);
    console.log('Delete action triggered for block:', block);
    // Add delete logic using block here
  };

  const handleCopy = () => {
    console.log('Copy action triggered for block:', block);
    // Add copy logic using block here
  };

  const handleCopyLink = () => {
    console.log('Copy Link action triggered for block:', block);
    // Add copy link logic using block here
  };

  const handleDuplicate = () => {
    if (block.pathId) handleAddBlockFn(block, block.pathId, block.position);
    setIsBlack(false);
    console.log('Duplicate action triggered for block:', block);
    // Add duplicate logic using block here
  };

  return (
    <div ref={toggleRef} className="relative">
      <div
        className={`w-12 h-12 cursor-pointer ${
          isBlack ? 'bg-black' : 'bg-gray-400'
        }`}
        onClick={handleToggleClick}
      ></div>

      {isBlack && (
        <div className="absolute top-full left-0 z-50">
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
