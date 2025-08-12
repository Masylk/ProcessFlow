import React, { useEffect, useState } from 'react';

const MIN_WIDTH = 900;

/**
 * Overlay that blocks the page if the screen is too small.
 * Only visible if window.innerWidth < 900px.
 */
export const ScreenSizeOverlay: React.FC = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const checkWidth = () => setShowOverlay(window.innerWidth < MIN_WIDTH);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (!showOverlay) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-black bg-opacity-70">
      <div className="flex flex-col items-center">
        {/* Icon: Exclamation mark inside a circle */}
        <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <line x1="12" y1="7" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="15" r="0.6" fill="currentColor" />
        </svg>
        <p className="text-white text-xl font-semibold mb-2">Your browser is too small</p>
        <p className="text-white text-center">Resize your browser to be at least <span className="font-bold">900px</span> wide to get back into edit mode.</p>
      </div>
    </div>
  );
};
