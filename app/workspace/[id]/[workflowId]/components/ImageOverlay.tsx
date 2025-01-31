import { useEffect } from 'react';

interface ImageOverlayProps {
  onClose: () => void;
}

const ImageOverlay: React.FC<ImageOverlayProps> = ({ onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      id="overlay"
      className="fixed w-[50000vw] h-[50000vh] left-[-20000vw] top-[-20000vh] z-20 bg-black bg-opacity-20 flex items-center justify-center"
      onClick={onClose} // Trigger onClose when the overlay is clicked
    >
      <div
        className="bg-white p-4 rounded shadow-lg"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the content from triggering onClose
      >
        {/* Render your content here */}
        <p className="text-black">Image Overlay Content</p>
      </div>
    </div>
  );
};

export default ImageOverlay;
