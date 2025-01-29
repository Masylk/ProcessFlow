import React, { useEffect, useState, useRef } from 'react';
import { Block } from '@/types/block'; // Adjust the import path as needed

interface SidebardivProps {
  block: Block;
  position: number;
}

const Sidebardiv: React.FC<SidebardivProps> = ({ block, position }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Utility function to strip HTML tags
  const stripTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // Function to crop the title if it's longer than 20 characters
  const cropTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  const cleanedTitle = block.title ? stripTags(block.title) : 'Untitled Block';
  const croppedTitle = cropTitle(cleanedTitle, 15);

  return (
    <div
      ref={divRef}
      className={`w-[250px] px-3 py-1.5 rounded-lg justify-start items-start gap-3 inline-flex flex-row space-x-2 ${
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
          className={`w-[350px] text-sm font-medium font-['Inter'] leading-tight cursor-pointer ${
            isActive ? 'text-white' : 'text-[#667085]'
          }`}
          style={{ maxWidth: '150px' }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent event from bubbling to the document
            setIsActive(true);
          }}
        >
          {croppedTitle}
        </div>
      </div>
    </div>
  );
};

export default Sidebardiv;
