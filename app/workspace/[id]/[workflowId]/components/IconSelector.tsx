import React, { useEffect, useState } from 'react';

interface IconSelectorProps {
  onSelect: (icon: string) => void;
}

interface Entity {
  basicUrl: string;
  signedUrl: string;
}

const IconSelector = ({ onSelect }: IconSelectorProps) => {
  const [applist, setAppList] = useState<Entity[]>([]);
  const [iconlist, setIconList] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        // Fetch the list of icons
        const response = await fetch('/api/step-icons');
        if (!response.ok) {
          throw new Error('Failed to fetch icons');
        }
        const data = await response.json();

        // Fetch signed URLs for apps and icons
        const fetchSignedUrls = async (path: string) => {
          const res = await fetch(
            `/api/get-signed-url?path=${encodeURIComponent(path)}`
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch signed URL for ${path}`);
          }
          const { signedUrl } = await res.json();
          return signedUrl;
        };

        const applistPromises = data.applist.map(async (app: string) => {
          const basicUrl = `step-icons/apps/${app}`;
          const signedUrl = await fetchSignedUrls(basicUrl);
          return { basicUrl, signedUrl };
        });

        const iconlistPromises = data.iconlist.map(async (icon: string) => {
          const basicUrl = `step-icons/default-icons/${icon}`;
          const signedUrl = await fetchSignedUrls(basicUrl);
          return { basicUrl, signedUrl };
        });

        const applistResult = await Promise.all(applistPromises);
        const iconlistResult = await Promise.all(iconlistPromises);

        setAppList(applistResult);
        setIconList(iconlistResult);
      } catch (error) {
        console.error(error);
      }
    };

    fetchIcons();
  }, []);

  // Filter apps and icons based on the search term
  const filteredApps = applist.filter((app) =>
    app.basicUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredIcons = iconlist.filter((icon) =>
    icon.basicUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to format the app name (capitalize first letter, lowercase the rest)
  const formatAppName = (name: string) => {
    const nameWithoutExtension = name.split('/').pop()?.split('.')[0] || ''; // Extract after the last '/' and remove extension
    return (
      nameWithoutExtension.charAt(0).toUpperCase() +
      nameWithoutExtension.slice(1).toLowerCase()
    );
  };

  return (
    <div className="w-[492px] h-[340px] bg-white rounded-xl border border-[#e4e7ec] flex flex-col">
      {/* Header with Search Bar */}
      <div className="self-stretch p-4 bg-white rounded-tl-xl rounded-tr-xl border-b border-[#e4e7ec] flex items-center gap-2">
        <div className="w-5 h-5">
          <img
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-icon.svg`}
            alt="Search Icon"
            className="w-full h-full object-contain"
          />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for an app or an icon"
          className="flex-grow text-[#667085] text-base font-normal font-['Inter'] leading-normal bg-transparent focus:outline-none"
        />
      </div>

      {/* Content */}
      <div className="self-stretch h-[284px] flex flex-col overflow-y-auto hide-scrollbar">
        {/* Apps Section */}
        <div className="self-stretch py-4 flex flex-col gap-0.5">
          {/* Category Label */}
          <div className="self-stretch px-[18px] flex items-center gap-1">
            <div className="flex-grow text-[#475467] text-sm font-medium font-['Inter'] leading-tight">
              Apps
            </div>
          </div>

          {/* Apps Grid */}
          <div className="self-stretch flex-1 flex flex-wrap gap-1 px-2 mt-3">
            {filteredApps.map((app, index) => (
              <button
                key={index}
                onClick={() => onSelect(app.basicUrl)} // Use basic URL for selection
                onMouseEnter={() => setHoveredIcon(app.basicUrl)} // Set hovered icon
                onMouseLeave={() => setHoveredIcon(null)} // Reset on mouse leave
                className="w-10 h-10 flex items-center justify-center focus:outline-none relative"
              >
                <img
                  src={app.signedUrl}
                  alt={app.basicUrl}
                  className="w-8 h-8 object-contain"
                />
                {hoveredIcon === app.basicUrl && (
                  <div className="absolute bottom-[70%] mb-2 w-24 left-5 transform -translate-x-1/2 z-10">
                    <div className="h-7 flex-col justify-start items-center inline-flex">
                      <div className="self-stretch h-[22px] px-2 py-0.5 bg-[#4761c4] rounded-lg flex-col justify-start items-start flex">
                        <div className="text-center text-white text-[10px] font-semibold font-['Inter'] leading-[18px]">
                          {formatAppName(app.basicUrl)}
                        </div>
                      </div>
                      <div className="w-7 h-4 relative" />
                    </div>
                    {/* Tooltip Icon */}
                    <div className="absolute bottom-[3%] left-1/2 transform -translate-x-1/2">
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/tooltip-icon.svg`}
                        alt="Tooltip Icon"
                        className="w-7 h-3 object-contain"
                      />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Icons Section */}
        <div className="self-stretch py-4 flex flex-col gap-0.5">
          {/* Category Label */}
          <div className="self-stretch px-[18px] flex items-center gap-1">
            <div className="flex-grow text-[#475467] text-sm font-medium font-['Inter'] leading-tight">
              Icons
            </div>
          </div>

          {/* Icons Grid */}
          <div className="self-stretch flex-1 flex flex-wrap gap-2 px-2 mt-3">
            {filteredIcons.map((icon, index) => (
              <button
                key={index}
                onClick={() => onSelect(icon.basicUrl)} // Use basic URL for selection
                className="w-10 h-10 flex items-center justify-center focus:outline-none"
              >
                <img
                  src={icon.signedUrl}
                  alt={icon.basicUrl}
                  className="w-8 h-8 object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconSelector;
