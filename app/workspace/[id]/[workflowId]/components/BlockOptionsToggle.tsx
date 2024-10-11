import { useState, useEffect, useRef } from 'react';
import BlockOptions from './BlockOptions'; // Import BlockOptions component

const BlockOptionsToggle = () => {
  const [isBlack, setIsBlack] = useState(false);
  const toggleRef = useRef<HTMLDivElement>(null);

  // Handle click on the toggle
  const handleToggleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevents the click from bubbling up
    setIsBlack(true); // Set to black when clicked
  };

  // Handle clicks outside of the toggle
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toggleRef.current &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        setIsBlack(false); // Set back to gray when clicking outside
      }
    };

    // Add event listener for clicks on the entire document
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Action handlers
  const handleDelete = () => {
    console.log('Delete action triggered');
    // Add delete logic here
  };

  const handleCopy = () => {
    console.log('Copy action triggered');
    // Add copy logic here
  };

  const handleCopyLink = () => {
    console.log('Copy Link action triggered');
    // Add copy link logic here
  };

  const handleDuplicate = () => {
    console.log('Duplicate action triggered');
    // Add duplicate logic here
  };

  return (
    <div ref={toggleRef} className="relative">
      {/* The square button */}
      <div
        className={`w-12 h-12 cursor-pointer ${
          isBlack ? 'bg-black' : 'bg-gray-400'
        }`}
        onClick={handleToggleClick}
      ></div>

      {/* BlockOptions appears directly below the square */}
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
