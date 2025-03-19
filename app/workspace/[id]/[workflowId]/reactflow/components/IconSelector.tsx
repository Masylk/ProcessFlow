import React, { useEffect, useState } from 'react';

const TABS = ['Icons', 'Apps'];

interface Entity {
  basicUrl: string;
  signedUrl: string;
}

interface IconSelectorProps {
  onSelect: (icon?: string) => void;
}

export default function IconSelector({ onSelect }: IconSelectorProps) {
  const [applist, setAppList] = useState<Entity[]>([]);
  const [iconlist, setIconList] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Icons');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await fetch('/api/step-icons');
        if (!response.ok) throw new Error('Failed to fetch icons');
        const data = await response.json();

        const applistResult: Entity[] = data.applist.map((app: string) => ({
          basicUrl: `step-icons/apps/${app}`,
          signedUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/apps/${app}`,
        }));

        const iconlistResult: Entity[] = data.iconlist.map((icon: string) => ({
          basicUrl: `step-icons/default-icons/${icon}`,
          signedUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_USER_STORAGE_PATH}/step-icons/default-icons/${icon}`,
        }));

        setAppList(applistResult);
        setIconList(iconlistResult);
      } catch (error) {
        console.error(error);
      }
    };

    fetchIcons();
  }, []);

  return (
    <div className="w-[502px] h-[328px] bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-lg">
      {/* Tabs */}
      <div className="self-stretch flex justify-between items-center border-b border-gray-200">
        <div className="flex gap-3 pt-3 px-3">
          {TABS.map((tab) => (
            <div
              key={tab}
              className={`px-2 pb-3 cursor-pointer transition-colors duration-200 ${
                activeTab === tab
                  ? 'border-b-2 border-[#3537cc] text-[#3537cc] font-medium'
                  : 'text-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div
          className="px-4 cursor-pointer transition-colors duration-200 text-gray-600"
          onClick={() => onSelect()}
        >
          Reset
        </div>
      </div>

      {/* Search Bar */}
      <div className="self-stretch px-4 py-3 flex items-center gap-2 bg-white border-b border-gray-200">
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-lg-icon.svg`}
          alt="Search icon"
          className="w-4 h-4"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-grow text-sm bg-transparent focus:outline-none text-gray-900 placeholder:text-gray-500"
        />
      </div>

      {/* Content */}
      <div className="self-stretch h-60 flex flex-col overflow-y-auto p-3 bg-white">
        {activeTab === 'Apps' && (
          <div className="grid grid-cols-12 gap-3">
            {applist
              .filter((app) =>
                app.basicUrl.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((app, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(app.basicUrl)}
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200"
                  style={{
                    backgroundColor:
                      hoveredButton === `app-${index}`
                        ? '#F5F5F5'
                        : 'transparent',
                  }}
                  onMouseEnter={() => setHoveredButton(`app-${index}`)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <img
                    src={app.signedUrl}
                    alt={app.basicUrl}
                    className="w-6 h-6 object-contain"
                  />
                </button>
              ))}
          </div>
        )}

        {activeTab === 'Icons' && (
          <div className="grid grid-cols-12 gap-3">
            {iconlist
              .filter((icon) =>
                icon.basicUrl.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((icon, index) => (
                <button
                  key={index}
                  onClick={() => onSelect(icon.basicUrl)}
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200"
                  style={{
                    backgroundColor:
                      hoveredButton === `icon-${index}`
                        ? '#F5F5F5'
                        : 'transparent',
                  }}
                  onMouseEnter={() => setHoveredButton(`icon-${index}`)}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <img
                    src={icon.signedUrl}
                    alt={icon.basicUrl}
                    className="w-6 h-6 object-contain"
                  />
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
