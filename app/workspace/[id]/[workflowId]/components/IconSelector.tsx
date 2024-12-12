import React from 'react';

const IconSelector = () => {
  return (
    <div className="w-[492px] h-[340px] bg-white rounded-xl border border-[#e4e7ec] flex flex-col">
      {/* Header */}
      <div className="self-stretch p-4 bg-white rounded-tl-xl rounded-tr-xl border-b border-[#e4e7ec] flex items-center gap-2">
        <div className="w-5 h-5" />
        <div className="flex-grow text-[#667085] text-base font-normal font-['Inter'] leading-normal">
          Search for an app or an icon
        </div>
        <div className="w-4 h-4 flex justify-center items-center">
          <div className="w-4 h-4" />
        </div>
      </div>

      {/* Content */}
      <div className="self-stretch h-[284px] flex flex-col">
        {/* Apps Section */}
        <div className="self-stretch h-[186px] py-4 flex flex-col gap-0.5">
          {/* Category Label */}
          <div className="self-stretch px-[18px] flex items-center gap-1">
            <div className="flex-grow text-[#475467] text-sm font-medium font-['Inter'] leading-tight">
              Apps
            </div>
          </div>

          {/* Icons Grid */}
          <div className="self-stretch h-[132px] flex flex-wrap gap-2 px-2 py-1.5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100"
              >
                {/* Placeholder for individual icon */}
                <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconSelector;
