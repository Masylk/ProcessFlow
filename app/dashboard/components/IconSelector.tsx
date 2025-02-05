import React, { useEffect, useState } from 'react';

const TABS = ['Icons', 'Apps', 'Emoji'];

interface Entity {
  basicUrl: string;
  signedUrl: string;
}

interface IconSelectorProps {
  onSelect: (icon?: string, emote?: string) => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ onSelect }) => {
  const [applist, setAppList] = useState<Entity[]>([]);
  const [iconlist, setIconList] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Icons');
  const [emojiList] = useState<string[]>([
    '💼',
    '📅',
    '📝',
    '📊',
    '📈',
    '💻',
    '🖥️',
    '📎',
    '📂',
    '🗂️',
    '📌',
    '📏',
    '📐',
    '🖊️',
    '🖋️',
    '🖌️',
    '🖍️',
    '✂️',
    '🔍',
    '🔎',
    '⌛',
    '⏳',
    '⏰',
    '🕰️',
    '🏢',
    '🏛️',
    '🏠',
    '📬',
    '📥',
    '📤',
    '📖',
    '📕',
    '📗',
    '📘',
    '📙',
    '📚',
    '🧠',
    '🎯',
    '🏆',
    '🥇',
    '🏅',
    '💡',
    '🔦',
    '🛠️',
    '🔧',
    '🔨',
    '🏗️',
    '🏭',
    '🏪',
    '📠',
    '📜',
    '🏋️‍♂️',
    '🚀',
    '🎓',
    '📣',
    '🏃‍♂️',
    '🏃‍♀️',
    '🎼',
    '🎨',
    '🧑‍💻',
    '👨‍💻',
    '👩‍💻',
    '📡',
    '🎙️',
    '🔢',
    '💰',
    '🏦',
    '🏛️',
    '🗃️',
    '📊',
  ]);

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
    <div className="w-[502px] h-[328px] bg-white rounded-xl border border-[#e4e7ec] flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="self-stretch border border-[#e4e7ec] flex justify-between items-center">
        <div className="flex gap-3 pt-3 px-3">
          {TABS.map((tab) => (
            <div
              key={tab}
              className={`px-2 pb-3 cursor-pointer ${
                activeTab === tab
                  ? 'border-b-2 border-[#4761c4] text-[#374c99] font-medium'
                  : 'text-[#667085]'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div
          className="px-4 cursor-pointer text-[#667085]"
          onClick={() => onSelect()}
        >
          Reset
        </div>
      </div>

      {/* Search Bar */}
      <div className="self-stretch px-4 py-3 bg-white border-b border-[#e4e7ec] flex items-center gap-2">
        <img
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/search-lg-icon.svg`}
          alt="Folder icon"
          className="w-4 h-4"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="flex-grow text-[#667085] text-sm bg-transparent focus:outline-none"
        />
      </div>

      {/* Content */}
      <div className="self-stretch h-60 flex flex-col overflow-y-auto p-3">
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
                  className="w-10 h-10"
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
                  className="w-10 h-10"
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

        {activeTab === 'Emoji' && (
          <div className="grid grid-cols-12 gap-3 text-xl">
            {emojiList.map((emoji, index) => (
              <button
                key={index}
                onClick={() => onSelect(undefined, emoji)}
                className="w-10 h-10 flex items-center justify-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IconSelector;
