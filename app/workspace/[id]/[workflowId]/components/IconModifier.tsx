import React, { useState, useEffect } from 'react';
import IconSelector from './IconSelector';

interface IconModifierProps {
  initialIcon?: string; // Optional initial icon
  onUpdate: (icon: string) => void; // Callback when an icon is updated
}

export default function IconModifier({
  initialIcon,
  onUpdate,
}: IconModifierProps) {
  const [selectedIcon, setSelectedIcon] = useState(initialIcon || '');
  const [signedIconUrl, setSignedIconUrl] = useState<string | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  // Fetch signed URL for the selected icon
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (selectedIcon) {
        try {
          const response = await fetch(
            `/api/get-signed-url?path=${encodeURIComponent(selectedIcon)}`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch signed URL');
          }
          const data = await response.json();
          setSignedIconUrl(data.signedUrl);
        } catch (error) {
          console.error(error);
          setSignedIconUrl(null);
        }
      } else {
        setSignedIconUrl(null);
      }
    };

    fetchSignedUrl();
  }, [selectedIcon]);

  const handleIconSelect = (icon: string) => {
    console.log('updating icon with: ' + icon);
    setSelectedIcon(icon);
    onUpdate(icon);
    setShowSelector(false);
  };

  const handleOverlayClick = () => {
    setShowSelector(false);
  };

  return (
    <div className="relative">
      {/* Icon Display */}
      <div
        className="p-2 bg-white rounded-lg shadow-inner border border-[#d0d5dd] flex justify-center items-center w-10 h-10 cursor-pointer"
        onClick={() => setShowSelector(!showSelector)}
      >
        {signedIconUrl ? (
          <img src={signedIconUrl} alt="Selected Icon" className="w-6 h-6" />
        ) : (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex justify-center items-center">
            <span className="text-gray-500 font-bold text-sm">i</span>
          </div>
        )}
      </div>

      {/* Black transparent overlay */}
      {showSelector && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={handleOverlayClick}
        />
      )}

      {/* Icon Selector */}
      {showSelector && (
        <div className="absolute top-12 left-0 z-20">
          <IconSelector onSelect={handleIconSelect} />
        </div>
      )}
    </div>
  );
}
