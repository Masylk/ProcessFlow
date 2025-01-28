import React, { useEffect, useState } from 'react';
import { Block } from '@/types/block'; // Adjust the import path as needed

interface SidebardivProps {
  block: Block;
  position: number;
  isActive?: boolean;
}

const Sidebardiv: React.FC<SidebardivProps> = ({
  block,
  position,
  isActive = false,
}) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        if (block.icon) {
          const response = await fetch(
            `/api/get-signed-url?path=${encodeURIComponent(block.icon)}`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch signed URL');
          }
          const { signedUrl } = await response.json();
          setIconUrl(signedUrl);
        }
      } catch (error) {
        console.error('Error fetching signed URL:', error);
      }
    };

    fetchSignedUrl();
  }, [block.icon]);

  // Utility function to strip HTML tags
  const stripTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Function to crop the title if it's longer than 20 characters
  const cropTitle = (title: string, maxLength: number) => {
    if (title.length > maxLength) {
      return title.slice(0, maxLength) + '...';
    }
    return title;
  };

  const cleanedTitle = block.title ? stripTags(block.title) : 'Untitled Block';
  const croppedTitle = cropTitle(cleanedTitle, 20);

  return (
    <div
      className={`px-3 py-1.5 rounded-lg justify-start items-start gap-3 inline-flex flex-row space-x-2 ${
        isActive ? 'bg-[#4761c4]' : ''
      }`}
    >
      <div
        className={`text-sm font-bold font-['Inter'] leading-tight w-2 ${
          isActive ? 'text-white' : 'text-[#101828]'
        }`}
      >
        {position + 1}.
      </div>

      {/* Icon and Title in a flex-row */}
      <div className="flex-row flex items-center gap-1">
        <div className="w-4 h-4 overflow-hidden">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt="Icon"
              className="w-full h-full object-contain"
            />
          ) : null}
        </div>
        <div
          className={`text-sm font-medium font-['Inter'] leading-tight ${
            isActive ? 'text-white' : 'text-[#667085]'
          }`}
          style={{ maxWidth: '150px' }} // Adjust width as needed
        >
          {croppedTitle}
        </div>
      </div>
    </div>
  );
};

export default Sidebardiv;
