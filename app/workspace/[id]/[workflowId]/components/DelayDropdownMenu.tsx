import React from 'react';

interface DelayDropdownkMenuProps {
  onClickCustomDelay: () => void;
  onClickDelay: (seconds: number) => Promise<void>;
}

const MINUTE_TO_SECOND = 60;
const HOUR_TO_SECOND = 3600;

const DelayDropdownMenu: React.FC<DelayDropdownkMenuProps> = ({
  onClickCustomDelay,
  onClickDelay,
}) => {
  return (
    <div className="h-[168px] bg-white rounded-lg shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08)] border border-[#e4e7ec] justify-start items-start inline-flex overflow-hidden">
      <div className="w-60 py-1 flex-col justify-start items-start inline-flex overflow-hidden">
        {/* Group for "Add 5 min" */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex group"
          onClick={() => onClickDelay(5 * MINUTE_TO_SECOND)}
        >
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden group-hover:bg-gray-50">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/workflow/clock-plus-icon.svg`}
                  alt="Clock Plus Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grow shrink basis-0 text-[#18212f] text-sm font-medium font-['Inter'] leading-tight">
                Add 5 min
              </div>
            </div>
          </div>
        </div>

        {/* Group for "Add 10 min" */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex group"
          onClick={() => onClickDelay(10 * MINUTE_TO_SECOND)}
        >
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden group-hover:bg-gray-50">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/workflow/clock-plus-icon.svg`}
                  alt="Clock Plus Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grow shrink basis-0 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Add 10 min
              </div>
            </div>
          </div>
        </div>

        {/* Group for "Add 30 min" */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex group"
          onClick={() => onClickDelay(30 * MINUTE_TO_SECOND)}
        >
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden group-hover:bg-gray-50">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/workflow/clock-plus-icon.svg`}
                  alt="Clock Plus Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grow shrink basis-0 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Add 30 min
              </div>
            </div>
          </div>
        </div>

        {/* Group for "Custom delay" */}
        <div
          className="self-stretch px-1.5 py-px justify-start items-center inline-flex group"
          onClick={onClickCustomDelay}
        >
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden group-hover:bg-gray-50">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="w-4 h-4 relative overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/workflow/clock-plus-icon.svg`}
                  alt="Clock Plus Icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grow shrink basis-0 text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                Custom delay
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayDropdownMenu;
