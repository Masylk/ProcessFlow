import React, { useState } from 'react';
import { useTransformEffect } from 'react-zoom-pan-pinch';
import ZoomBarDropdownMenu from './ZoomBarDropdownMenu';

type AnimationType =
  | 'easeOut'
  | 'linear'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint';

type ZoomFunction = (
  step?: number,
  animationTime?: number,
  animationType?: AnimationType
) => void;

type SetTransformFunction = (
  x: number,
  y: number,
  scale: number,
  animationTime?: number,
  animationType?: AnimationType
) => void;

type ZoomBarProps = {
  zoomIn: ZoomFunction;
  zoomOut: ZoomFunction;
  setTransform: SetTransformFunction;
  isBackground: boolean;
};

const ZoomBar: React.FC<ZoomBarProps> = ({
  zoomIn,
  zoomOut,
  setTransform,
  isBackground,
}) => {
  const [zoomPercentage, setZoomPercentage] = useState(100); // Default to 100%
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Dropdown visibility

  const zoomInIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/zoom-in.svg`;
  const zoomOutIconUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/zoom-out.svg`;

  // Sync zoom percentage with the transform state
  useTransformEffect(({ state }) => {
    setZoomPercentage(Math.round(state.scale * 100)); // Update zoom percentage based on scale
  });

  // Handle zoom percentage input
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setZoomPercentage(value);
    }
  };

  // Apply the entered zoom percentage
  const applyZoom = () => {
    const scale = zoomPercentage / 100; // Convert percentage to scale
    setTransform(0, 0, scale); // Set the scale, keeping x and y as 0
  };

  // Do not render the component if isBackground is true
  if (isBackground) {
    return null;
  }

  return (
    <div className="h-10 overflow-hidden rounded-lg border border-[#d0d5dd] justify-start items-start inline-flex shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18),inset_0px_-2px_0px_rgba(16,24,40,0.05),0px_1px_2px_rgba(16,24,40,0.05)]">
      {/* Zoom Out Button */}
      <div
        onClick={() => zoomOut()}
        className="px-3 py-2 h-full bg-white border-[#d0d5dd] justify-center items-center gap-2 flex cursor-pointer"
      >
        <img src={zoomOutIconUrl} alt="Zoom Out" className="w-5 h-5" />
      </div>

      {/* Zoom Percentage Button */}
      <button
        onClick={() => setIsDropdownVisible(!isDropdownVisible)} // Toggle dropdown visibility
        className="px-3 py-2 h-full bg-white border-l border-r border-[#d0d5dd] justify-center items-center gap-2 flex cursor-pointer"
      >
        <span className="text-sm font-semibold text-[#344054]">
          {zoomPercentage}%
        </span>
      </button>

      {/* Zoom In Button */}
      <div
        onClick={() => zoomIn()}
        className="px-3 py-2 h-full bg-white border-[#d0d5dd] justify-center items-center gap-2 flex cursor-pointer"
      >
        <img src={zoomInIconUrl} alt="Zoom In" className="w-5 h-5" />
      </div>

      {/* Zoom Bar Dropdown Menu */}
      {isDropdownVisible && (
        <ZoomBarDropdownMenu
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          setTransform={setTransform}
        />
      )}
    </div>
  );
};

export default ZoomBar;
