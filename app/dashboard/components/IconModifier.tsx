import React, { useState, useRef, useEffect, useCallback } from 'react';
import IconSelector from './IconSelector';
import { useColors } from '@/app/theme/hooks';
import ReactDOM from 'react-dom';
import { fetchSignedUrl } from '@/utils/supabase/fetch_url';
import {
  fetchIconsBatch,
  preloadCriticalIcons,
} from '@/utils/optimizedIconFetch';

interface Entity {
  basicUrl: string;
  signedUrl: string;
}

interface IconModifierProps {
  initialIcon?: string; // Optional initial icon
  emote?: string;
  onUpdate: (
    icon?: string,
    emote?: string,
    signedIcon?: string,
    file?: File
  ) => void; // Callback when an icon is updated
  allowEmoji?: boolean; // Add this prop
  flow?: boolean;
}

export default function IconModifier({
  initialIcon,
  onUpdate,
  emote,
  allowEmoji = true, // Default to true
  flow = false,
}: IconModifierProps) {
  const colors = useColors();
  const [showSelector, setShowSelector] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const iconButtonRef = useRef<HTMLDivElement>(null);
  const [iconUrl, setIconUrl] = useState<string | undefined>(initialIcon);
  const [applist, setAppList] = useState<Entity[]>([]);
  const [iconlist, setIconList] = useState<Entity[]>([]);

  // Calculate and set the position for the IconSelector
  useEffect(() => {
    if (showSelector && iconButtonRef.current) {
      const rect = iconButtonRef.current.getBoundingClientRect();
      // Place the selector below the icon button, with a small gap
      setSelectorPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  }, [showSelector]);

  // Only close selector on Escape key
  useEffect(() => {
    if (!showSelector) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSelector(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [showSelector]);

  useEffect(() => {
    setIconUrl(initialIcon);
  }, [initialIcon]);

  // Fetch icons and signed URLs with optimized batch loading
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const response = await fetch('/api/step-icons');
        if (!response.ok) throw new Error('Failed to fetch icons');
        const data = await response.json();

        // Use optimized batch fetching with caching and fallback
        const { applistResult, iconlistResult } = await fetchIconsBatch(
          data.applist,
          data.iconlist
        );

        // Convert to Entity format
        const appEntities: Entity[] = applistResult.map((item) => ({
          basicUrl: item.basicUrl,
          signedUrl: item.signedUrl,
        }));

        const iconEntities: Entity[] = iconlistResult.map((item) => ({
          basicUrl: item.basicUrl,
          signedUrl: item.signedUrl,
        }));

        setAppList(appEntities);
        setIconList(iconEntities);

        // Preload critical icons for better perceived performance
        const criticalIconUrls = [
          ...appEntities.slice(0, 10).map((item) => item.signedUrl),
          ...iconEntities.slice(0, 10).map((item) => item.signedUrl),
        ].filter((url) => url);

        if (criticalIconUrls.length > 0) {
          preloadCriticalIcons(criticalIconUrls, 20);
        }
      } catch (error) {
        console.error('Error fetching icons:', error);

        // Fallback to old method if new approach fails completely
        try {
          const response = await fetch('/api/step-icons');
          if (!response.ok) throw new Error('Failed to fetch icons');
          const data = await response.json();

          // Set initial lists with empty signedUrl
          const applistResult: Entity[] = data.applist.map((app: string) => ({
            basicUrl: `step-icons/apps/${app}`,
            signedUrl: '',
          }));
          const iconlistResult: Entity[] = data.iconlist.map(
            (icon: string) => ({
              basicUrl: `step-icons/default-icons/${icon}`,
              signedUrl: '',
            })
          );

          setAppList(applistResult);
          setIconList(iconlistResult);

          // Fetch signed URLs individually as fallback
          data.applist.forEach(async (app: string, idx: number) => {
            const basicUrl = `step-icons/apps/${app}`;
            const signedUrl = await fetchSignedUrl(basicUrl);
            setAppList((prev) =>
              prev.map((item, i) =>
                i === idx ? { ...item, signedUrl: signedUrl || '' } : item
              )
            );
          });

          data.iconlist.forEach(async (icon: string, idx: number) => {
            const basicUrl = `step-icons/default-icons/${icon}`;
            const signedUrl = await fetchSignedUrl(basicUrl);
            setIconList((prev) =>
              prev.map((item, i) =>
                i === idx ? { ...item, signedUrl: signedUrl || '' } : item
              )
            );
          });
        } catch (fallbackError) {
          console.error('Fallback icon fetching also failed:', fallbackError);
        }
      }
    };

    fetchIcons();
  }, []);

  const handleIconSelect = (
    icon?: string,
    emote?: string,
    signedIcon?: string,
    file?: File
  ) => {
    onUpdate(icon, emote, signedIcon, file);
    setShowSelector(false);
  };

  // The icon button
  const iconButton = (
    <div
      ref={iconButtonRef}
      className="p-2 rounded-md shadow-inner flex justify-center items-center w-10 cursor-pointer transition-colors duration-200"
      style={{
        backgroundColor: colors['bg-primary'],
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: colors['border-secondary'],
      }}
      onClick={() => setShowSelector((v) => !v)}
    >
      {iconUrl && !emote ? (
        <img
          src={iconUrl}
          alt="Selected Icon"
          className="w-6 h-6 select-none pointer-events-none"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : emote ? (
        <div className="w-6 h-6 flex items-center justify-center">{emote}</div>
      ) : (
        <div className="w-6 h-6 flex justify-center items-center">
          <img
            src={`${
              flow
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/logo/logomark-pf.png`
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/folder-icon-base.svg`
            }`}
            alt="Default Icon"
            className="w-6 h-6 select-none pointer-events-none"
          />
        </div>
      )}
    </div>
  );

  // Only render the selector, no backdrop
  const selectorPortal =
    showSelector && selectorPosition
      ? ReactDOM.createPortal(
          <>
            {/* Backdrop to capture outside clicks */}
            <div
              className="fixed inset-0 z-[9999]"
              onClick={() => setShowSelector(false)}
            />
            <div
              className="fixed z-[10000]"
              style={{
                top: selectorPosition.top,
                left: selectorPosition.left,
              }}
            >
              <IconSelector
                onSelect={handleIconSelect}
                allowEmoji={allowEmoji}
                applist={applist}
                iconlist={iconlist}
              />
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      {iconButton}
      {selectorPortal}
    </>
  );
}
