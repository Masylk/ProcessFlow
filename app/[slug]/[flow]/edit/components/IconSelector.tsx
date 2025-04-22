import React, { useEffect, useState } from 'react';
import { useColors } from '@/app/theme/hooks';

const TABS = ['Apps', 'Icons'];

interface Entity {
  basicUrl: string;
  signedUrl: string;
}

interface IconSelectorProps {
  onSelect: (icon?: string) => void;
}

// Popular brands mapping
const BRAND_TO_DOMAIN: { [brand: string]: string } = {
  Google: 'google.com',
  Facebook: 'facebook.com',
  Twitter: 'twitter.com',
  Instagram: 'instagram.com',
  LinkedIn: 'linkedin.com',
  Microsoft: 'microsoft.com',
  Apple: 'apple.com',
  Amazon: 'amazon.com',
  Netflix: 'netflix.com',
  Spotify: 'spotify.com',
  Uber: 'uber.com',
  Airbnb: 'airbnb.com',
  Slack: 'slack.com',
  Dropbox: 'dropbox.com',
  Zoom: 'zoom.us',
  Pinterest: 'pinterest.com',
  Reddit: 'reddit.com',
  Salesforce: 'salesforce.com',
  Shopify: 'shopify.com',
  Adobe: 'adobe.com',
};

export default function IconSelector({ onSelect }: IconSelectorProps) {
  const colors = useColors();
  const [applist, setAppList] = useState<Entity[]>([]);
  const [iconlist, setIconList] = useState<Entity[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Apps');
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  // Add state for Logo.dev preview loading
  const [logoDevLoading, setLogoDevLoading] = useState(false);
  const [logoDevLoaded, setLogoDevLoaded] = useState(false);
  const [logoDevError, setLogoDevError] = useState(false);

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
      className="w-[502px] h-[328px] rounded-xl flex flex-col overflow-hidden shadow-lg"
      style={{ 
        backgroundColor: colors['bg-primary'],
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: colors['border-primary']
      }}
    >
      {/* Tabs */}
      <div 
        className="self-stretch flex justify-between items-center"
        style={{ 
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: colors['border-primary']
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
        className="self-stretch px-4 py-3 flex flex-col gap-2"
        style={{ 
          backgroundColor: colors['bg-primary'],
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: colors['border-primary']
        }}
      >
        <div className="flex items-center gap-2">
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
        {activeTab === 'Apps' && (
          <div
            className="flex items-start gap-2 mt-1 px-3 py-2 rounded-md text-xs"
            style={{
              backgroundColor: colors['bg-quaternary'],
              color: colors['text-secondary'],
              borderLeft: `3px solid ${colors['border-brand_alt']}`,
            }}
          >
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
            </svg>
            <span>
              You can search for any company logo by typing a domain (e.g., <span className="font-semibold">google.com</span>) or brand name. If not found, we'll fetch it.
            </span>
          </div>
        )}
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
                  className="w-10 h-10 rounded-md flex items-center justify-center transition-colors duration-200"
                  style={{
                    backgroundColor:
                      hoveredButton === `app-${index}`
                        ? colors['bg-quaternary']
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
            {/* Logo.dev integration in Apps tab */}
            {searchTerm && applist.filter((app) =>
                app.basicUrl.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <button
                  className="w-10 h-10 rounded-md flex items-center justify-center border-2 border-dashed transition-colors duration-200 relative"
                  style={{
                    borderColor: colors['border-brand_alt'],
                    backgroundColor: hoveredButton === 'apps-logo-dev' ? colors['bg-quaternary'] : 'transparent',
                  }}
                  onClick={() => onSelect(`https://img.logo.dev/${searchTerm}?token=pk_GET-5Hu0QUWA8eKBOj8RjQ`)}
                  onMouseEnter={() => setHoveredButton('apps-logo-dev')}
                  onMouseLeave={() => setHoveredButton(null)}
                  title={`Logo.dev: ${searchTerm}`}
                >
                  {/* Spinner or image */}
                  {!logoDevLoaded && (
                    <svg className="animate-spin w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" style={{ color: colors['border-brand_alt'] }}>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  <img
                    src={`https://img.logo.dev/${searchTerm}?token=pk_GET-5Hu0QUWA8eKBOj8RjQ`}
                    alt={`Logo for ${searchTerm}`}
                    className={`w-6 h-6 object-contain ${logoDevLoaded ? '' : 'hidden'}`}
                    onLoad={() => { setLogoDevLoaded(true); setLogoDevLoading(false); setLogoDevError(false); }}
                    onError={() => { setLogoDevLoaded(false); setLogoDevLoading(false); setLogoDevError(true); }}
                    onLoadStart={() => { setLogoDevLoading(true); setLogoDevLoaded(false); setLogoDevError(false); }}
                  />
                </button>
            )}
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
                        ? colors['bg-quaternary']
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
