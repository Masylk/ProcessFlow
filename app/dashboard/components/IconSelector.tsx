import React, { useEffect, useState } from 'react';
import { useColors } from '@/app/theme/hooks';

interface Entity {
  basicUrl: string;
  signedUrl: string;
}

interface IconSelectorProps {
  onSelect: (icon?: string, emote?: string) => void;
  allowEmoji?: boolean;
}

const IconSelector: React.FC<IconSelectorProps> = ({ onSelect, allowEmoji = true }) => {
  const colors = useColors();
  const [applist, setAppList] = useState<Entity[]>([]);
  const [iconlist, setIconList] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Icons');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [emojiList] = useState<string[]>([
    '💼', '📅', '📝', '📊', '📈', '💻', '🖥️', '📎', '📂', '🗂️',
    '📌', '📏', '📐', '🖊️', '🖋️', '🖌️', '🖍️', '✂️', '🔍', '🔎',
    '⌛', '⏳', '⏰', '🕰️', '🏢', '🏛️', '🏠', '📬', '📥', '📤',
    '📖', '📕', '📗', '📘', '📙', '📚', '🧠', '🎯', '🏆', '🥇',
    '🏅', '💡', '🔦', '🛠️', '🔧', '🔨', '🏗️', '🏭', '🏪', '📠',
    '📜', '🏋️‍♂️', '🚀', '🎓', '📣', '🏃‍♂️', '🏃‍♀️', '🎼', '🎨', '🧑‍💻',
    '👨‍💻', '👩‍💻', '📡', '🎙️', '🔢', '💰', '🏦', '🏛️', '🗃️', '📊',
  ]);

  const TABS = allowEmoji ? ['Icons', 'Apps', 'Emoji'] : ['Icons', 'Apps'];

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
    <div 
      className="w-[502px] h-[328px] rounded-xl flex flex-col overflow-hidden"
      style={{ 
        backgroundColor: colors['bg-primary'],
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: colors['border-secondary']
      }}
    >
      {/* Tabs */}
      <div 
        className="self-stretch flex justify-between items-center"
        style={{ 
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: colors['border-secondary']
        }}
      >
        <div className="flex gap-3 pt-3 px-3">
          {TABS.map((tab) => (
            <div
              key={tab}
              className={`px-2 pb-3 cursor-pointer transition-colors duration-200 ${
                activeTab === tab
                  ? 'border-b-2 font-medium'
                  : ''
              }`}
              style={{
                color: activeTab === tab ? colors['text-brand-secondary'] : colors['text-secondary'],
                borderBottomColor: activeTab === tab ? colors['bg-brand-solid'] : 'transparent'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
        <div
          className="px-4 cursor-pointer transition-colors duration-200"
          style={{ color: colors['text-secondary'] }}
          onClick={() => onSelect()}
        >
          Reset
        </div>
      </div>

      {/* Search Bar */}
      <div 
        className="self-stretch px-4 py-3 flex items-center gap-2"
        style={{ 
          backgroundColor: colors['bg-primary'],
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: colors['border-secondary']
        }}
      >
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
          className="flex-grow text-sm bg-transparent focus:outline-none placeholder:text-secondary"
          style={{ color: colors['text-primary'] }}
        />
      </div>

      {/* Content */}
      <div 
        className="self-stretch h-60 flex flex-col overflow-y-auto p-3"
        style={{ backgroundColor: colors['bg-primary'] }}
      >
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
                  className="w-10 h-10 rounded-md transition-colors duration-200 flex items-center justify-center"
                  style={{ 
                    backgroundColor: hoveredButton === `app-${index}` ? colors['bg-quaternary'] : 'transparent'
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
                  className="w-10 h-10 rounded-md transition-colors duration-200 flex items-center justify-center"
                  style={{ 
                    backgroundColor: hoveredButton === `icon-${index}` ? colors['bg-quaternary'] : 'transparent'
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

        {activeTab === 'Emoji' && (
          <div className="grid grid-cols-12 gap-3 text-xl">
            {emojiList.map((emoji, index) => (
              <button
                key={index}
                onClick={() => onSelect(undefined, emoji)}
                className="w-10 h-10 flex items-center justify-center rounded-md transition-colors duration-200"
                style={{ 
                  backgroundColor: hoveredButton === `emoji-${index}` ? colors['bg-quaternary'] : 'transparent'
                }}
                onMouseEnter={() => setHoveredButton(`emoji-${index}`)}
                onMouseLeave={() => setHoveredButton(null)}
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
