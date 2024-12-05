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
      className="fixed w-[50000vw] h-[50000vh] left-[-20000vw] top-[-20000vh] inset-0 z-30 bg-black bg-opacity-50 flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Render your content here */}
      <p className="text-white">Image Overlay Content</p>
    </div>
  );
};

export default ImageOverlay;
