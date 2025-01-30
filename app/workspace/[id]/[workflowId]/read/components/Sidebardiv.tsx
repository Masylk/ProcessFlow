import React, { useEffect, useState, useRef } from 'react';
import { Block } from '@/types/block';
import SidebarList from './SidebarList'; // Import SidebarList
import SidebarPath from './SidebarPath';

interface SidebardivProps {
  block: Block;
  position: number;
}

const Sidebardiv: React.FC<SidebardivProps> = ({ block, position }) => {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const storagePath = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH || '';
  const divRef = useRef<HTMLDivElement>(null);
  const [isSubpathsVisible, setIsSubpathsVisible] = useState(false);
  const chevronDownIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/chevron-down.svg`;
  const chevronUpIconUrl = `${supabaseUrl}${storagePath}/assets/shared_components/chevron-right.svg`;

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        if (block.icon) {
          const response = await fetch(
            `/api/get-signed-url?path=${encodeURIComponent(block.icon)}`
          );
          if (!response.ok) throw new Error('Failed to fetch signed URL');
          const { signedUrl } = await response.json();
          setIconUrl(signedUrl);
        }
      } catch (error) {
        console.error('Error fetching signed URL:', error);
      }
    };

    fetchSignedUrl();
  }, [block.icon]);

  const toggleSubpathsVisibility = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsSubpathsVisible((prev) => !prev);
  };

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

  const stripTags = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  const cropTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? title.slice(0, maxLength) + '...' : title;
  };

  const cleanedTitle = block.path_block
    ? 'Condition'
    : block.title
    ? stripTags(block.title)
    : 'Untitled Block';
  const croppedTitle = cropTitle(cleanedTitle, 50);

  return (
    <div ref={divRef}>
      {/* Block Content */}
      <div
        className={` w-full px-3 py-1.5 rounded-lg justify-start items-start gap-3 inline-flex flex-row space-x-2 ${
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

        {/* Icon and Title */}
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
            className={`w-full text-sm font-medium font-['Inter'] leading-tight cursor-pointer ${
              isActive ? 'text-white' : 'text-[#667085]'
            }`}
            // style={{ maxWidth: '150px' }}
            onClick={(e) => {
              e.stopPropagation();
              setIsActive(true);
            }}
          >
            {croppedTitle}
          </div>
        </div>
        {/* Toggle Subpaths Icon */}
        {block.path_block?.paths && block.path_block.paths.length > 0 && (
          <div
            className="cursor-pointer "
            onClick={toggleSubpathsVisibility}
            aria-label="Toggle Subpaths Visibility"
          >
            <img
              src={
                isSubpathsVisible
                  ? chevronDownIconUrl || ''
                  : chevronUpIconUrl || ''
              }
              alt={isSubpathsVisible ? 'Collapse' : 'Expand'}
              className="w-4 h-4"
            />
          </div>
        )}
      </div>

      {/* Render Nested SidebarList for path_blocks */}
      {isSubpathsVisible &&
        block.path_block?.paths &&
        block.path_block.paths.length > 0 && (
          <div className="ml-4 border-gray-300">
            {block.path_block.paths.map((path) => (
              <SidebarPath key={path.id} path={path} />
            ))}
          </div>
        )}
    </div>
  );
};

export default Sidebardiv;
