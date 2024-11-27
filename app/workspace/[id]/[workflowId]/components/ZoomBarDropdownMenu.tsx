import React, { useState, useEffect, useRef } from 'react';
import { useTransformEffect } from 'react-zoom-pan-pinch';

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

type ZoomBarDropdownMenuProps = {
  zoomIn: ZoomFunction;
  zoomOut: ZoomFunction;
  setTransform: SetTransformFunction;
};

const ZoomBarDropdownMenu: React.FC<ZoomBarDropdownMenuProps> = ({
  zoomIn,
  zoomOut,
  setTransform,
}) => {
  const [zoomPercentage, setZoomPercentage] = useState(100); // Default to 100%
  const inputRef = useRef<HTMLInputElement>(null); // Create a ref for the input

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
  const applyZoom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const scale = zoomPercentage / 100; // Convert percentage to scale
      setTransform(0, 0, scale); // Set the scale, keeping x and y as 0
    }
  };

  // Focus and select all text in the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input element
      inputRef.current.select(); // Select all text in the input
    }
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return (
    <div className="absolute top-[56px] left-[-130px] bg-white rounded-lg shadow border border-[#e4e7ec] flex-col justify-start items-start inline-flex z-50 w-[250px]">
      {/* Dropdown Content */}
      <div className="self-stretch h-[160px] py-2 flex-col justify-start items-start flex">
        {/* Zoom Percentage Input */}
        <div className="self-stretch h-14 px-2 py-2 flex-col justify-start items-start gap-1.5 flex">
          <div className="self-stretch h-12 flex-col justify-start items-start gap-1.5 flex">
            <div className="self-stretch px-3 py-3 bg-white rounded-lg shadow border-2 border-[#4e6bd7] justify-start items-center gap-2 inline-flex">
              <input
                ref={inputRef} // Attach the ref to the input
                type="text"
                value={zoomPercentage} // Show numeric value only
                onChange={handleZoomChange}
                onKeyDown={applyZoom}
                className="text-[#101828] text-base font-normal font-['Inter'] leading-normal bg-transparent border-none outline-none w-full pl-2 text-left" // Adjust width and padding for left alignment
              />
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="self-stretch py-1 justify-start items-center inline-flex" />

        <div className="self-stretch px-2 py-px justify-start items-center inline-flex">
          <button
            onClick={() => zoomIn()}
            className="grow shrink basis-0 h-[40px] px-3 py-[10px] rounded-md justify-between items-center gap-3 flex"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <img
                  src="/assets/shared_components/zoom-in.svg" // Use the path to your zoom-in icon
                  alt="Zoom In"
                  className="w-4 h-4" // Adjust size if needed
                />
              </div>
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Zoom In
              </div>
            </div>
            <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              ⌘D
            </div>
          </button>
        </div>

        <div className="self-stretch px-2 py-px justify-start items-center inline-flex">
          <button
            onClick={() => zoomOut()}
            className="grow shrink basis-0 h-[40px] px-3 py-[10px] rounded-md justify-between items-center gap-3 flex"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 relative">
                <img
                  src="/assets/shared_components/zoom-out.svg" // Use the path to your zoom-out icon
                  alt="Zoom Out"
                  className="w-4 h-4" // Adjust size if needed
                />
              </div>
              <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Zoom Out
              </div>
            </div>
            <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              ⌘C
            </div>
          </button>
        </div>

        {/* Zoom to Fit (Disabled) */}
        {/* <div className="self-stretch px-2 py-px justify-start items-center inline-flex">
          <button
            disabled
            className="grow shrink basis-0 h-[40px] px-3 py-[10px] rounded-md justify-between items-center gap-3 flex opacity-50 cursor-not-allowed"
          >
            <div className="w-4 h-4 relative" />
            <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
              Zoom to Fit
            </div>
            <div className="text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              ⌘L
            </div>
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default ZoomBarDropdownMenu;
