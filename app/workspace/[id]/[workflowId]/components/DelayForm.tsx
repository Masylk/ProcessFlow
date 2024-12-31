import React, { useState } from 'react';

interface DelayFormProps {
  onSubmit: (blockData: any, pathId: number, position: number) => void;
  onCancel: () => void;
  initialPosition: number;
  workflowId: number;
  pathId: number;
  position: number;
}

export default function DelayForm({
  onSubmit,
  onCancel,
  initialPosition,
  workflowId,
  pathId,
  position,
}: DelayFormProps) {
  const [description, setDescription] = useState('');
  const [delay, setDelay] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      {
        type: 'DELAY',
        position: initialPosition,
        icon: 'clock-icon',
        description,
        workflowId,
        delayBlock: {
          delay: delay,
        },
      },
      pathId,
      position
    );
  };

  return (
    <div className="w-[512px] h-96 bg-white rounded-xl shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08)] flex-col justify-start items-center inline-flex overflow-hidden">
      <div className="w-[336px] h-[336px] relative">
        <div className="w-[336px] h-[336px] left-[-208.5px] top-[-120px] absolute">
          <div className="w-24 h-24 left-[120px] top-[120px] absolute rounded-full border border-[#e4e7ec] opacity-100" />
          <div className="w-24 h-24 left-[120px] top-[120px] absolute rounded-full border border-[#e4e7ec] opacity-90" />
          <div className="w-36 h-36 left-[96px] top-[96px] absolute rounded-full border border-[#e4e7ec] opacity-80" />
          <div className="w-48 h-48 left-[72px] top-[72px] absolute rounded-full border border-[#e4e7ec] opacity-70" />
          <div className="w-60 h-60 left-[48px] top-[48px] absolute rounded-full border border-[#e4e7ec] opacity-60" />
          <div className="w-72 h-72 left-[24px] top-[24px] absolute rounded-full border border-[#e4e7ec] opacity-40" />
          <div className="w-[336px] h-[336px] left-0 top-0 absolute rounded-full border border-[#e4e7ec] opacity-20" />
        </div>
      </div>
      {/* Flex container for the cloned icons */}
      <div className="self-stretch pb-5 px-6 flex justify-between items-start">
        {/* Original icon */}
        <div className="w-12 h-12 p-3 bg-white rounded-[10px] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#e4e7ec] justify-center items-center inline-flex overflow-hidden">
          <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
            <img
              src="/assets/shared_components/git-branch-icon.svg"
              alt="Git Branch Icon"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Cloned icon */}
        <div
          className="w-12 h-12 p-3 bg-white rounded-[10px] justify-center items-center inline-flex overflow-hidden cursor-pointer"
          onClick={onCancel}
        >
          <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
            <img
              src="/assets/shared_components/x-close-icon.svg"
              alt="Close Icon"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>
      <div className="self-stretch h-[68px] flex-col justify-start items-center flex">
        <div className="self-stretch h-[140px] px-6 flex-col justify-start items-start gap-5 flex">
          <div className="self-stretch h-[52px] flex-col justify-start items-start gap-1 flex">
            <div className="self-stretch text-[#101828] text-lg font-semibold font-['Inter'] leading-7 z-10">
              Set custom delay
            </div>
            <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight z-10">
              Wait for a specified amount of time before continuing
            </div>
          </div>
        </div>
        <div className="self-stretch h-5" />
      </div>
      <div className="flex-col justify-start items-start gap-5 inline-flex">
        <div className="self-stretch justify-start items-start gap-1 inline-flex">
          <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
            <div className="self-stretch h-[66px] flex-col justify-start items-start gap-1.5 flex">
              <div className="justify-start items-start gap-0.5 inline-flex">
                <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Days
                </div>
              </div>
              <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex overflow-hidden">
                <div className="justify-start items-center gap-2 flex">
                  <div className="w-[122.67px] text-[#101828] text-base font-normal font-['Inter'] leading-normal">
                    2
                  </div>
                  <div className="shadow-[inset_0px_0px_0px_0.5000000596046448px_rgba(16,24,40,0.18)] border-l border-[#d0d5dd] flex-col justify-start items-start inline-flex overflow-hidden">
                    <div className="px-1.5 py-1 bg-white border-r border-[#d0d5dd] justify-center items-center gap-1 inline-flex">
                      <div className="w-2.5 h-2.5 px-[2.50px] justify-center items-center flex overflow-hidden" />
                    </div>
                    <div className="px-1.5 py-1 bg-white border-t border-[#d0d5dd] justify-center items-center gap-1 inline-flex">
                      <div className="w-2.5 h-2.5 px-[2.50px] justify-center items-center flex overflow-hidden" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
            <div className="self-stretch h-[66px] flex-col justify-start items-start gap-1.5 flex">
              <div className="justify-start items-start gap-0.5 inline-flex">
                <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Hours
                </div>
              </div>
              <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex overflow-hidden">
                <div className="justify-start items-center gap-2 flex">
                  <div className="w-[122.67px] text-[#101828] text-base font-normal font-['Inter'] leading-normal">
                    4
                  </div>
                  <div className="shadow-[inset_0px_0px_0px_0.5000000596046448px_rgba(16,24,40,0.18)] border-l border-[#d0d5dd] flex-col justify-start items-start inline-flex overflow-hidden">
                    <div className="px-1.5 py-1 bg-white border-r border-[#d0d5dd] justify-center items-center gap-1 inline-flex">
                      <div className="w-2.5 h-2.5 px-[2.50px] justify-center items-center flex overflow-hidden" />
                    </div>
                    <div className="px-1.5 py-1 bg-white border-t border-[#d0d5dd] justify-center items-center gap-1 inline-flex">
                      <div className="w-2.5 h-2.5 px-[2.50px] justify-center items-center flex overflow-hidden" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex">
            <div className="self-stretch h-[66px] flex-col justify-start items-start gap-1.5 flex">
              <div className="justify-start items-start gap-0.5 inline-flex">
                <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Minutes
                </div>
              </div>
              <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex overflow-hidden">
                <div className="justify-start items-center gap-2 flex">
                  <div className="w-[122.67px] text-[#667085] text-base font-normal font-['Inter'] leading-normal">
                    0
                  </div>
                  <div className="shadow-[inset_0px_0px_0px_0.5000000596046448px_rgba(16,24,40,0.18)] border-l border-[#d0d5dd] flex-col justify-start items-start inline-flex overflow-hidden">
                    <div className="px-1.5 py-1 bg-white border-r border-[#d0d5dd] justify-center items-center gap-1 inline-flex">
                      <div className="w-2.5 h-2.5 px-[2.50px] justify-center items-center flex overflow-hidden" />
                    </div>
                    <div className="px-1.5 py-1 bg-white border-t border-[#d0d5dd] justify-center items-center gap-1 inline-flex">
                      <div className="w-2.5 h-2.5 px-[2.50px] justify-center items-center flex overflow-hidden" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch mx-10 px-3 py-2 bg-white rounded-xl border border-[#d0d5dd] justify-start items-start gap-4 inline-flex overflow-hidden">
          <div className="grow shrink basis-0 h-[22px] pr-2 justify-start items-center gap-2 flex">
            <div className="w-5 h-5 rounded-full justify-center items-center flex">
              <div className="w-5 h-5 relative flex-col justify-start items-start flex overflow-hidden" />
            </div>
            <div className="grow shrink basis-0 pt-0.5 flex-col justify-start items-start gap-3 inline-flex">
              <div className="self-stretch h-5 flex-col justify-start items-start gap-1 flex">
                <div className="self-stretch text-[#101828] text-sm font-semibold font-['Inter'] leading-tight">
                  Delay of 2 days and 4 hours.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="self-stretch h-[100px] pt-8 flex-col justify-start items-start flex">
        <div className="self-stretch px-6 pb-6 justify-start items-start gap-3 inline-flex">
          <div
            className="grow shrink basis-0 h-11 px-4 py-2.5 bg-white rounded-lg shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#d0d5dd] justify-center items-center gap-1.5 flex overflow-hidden cursor-pointer"
            onClick={onCancel}
          >
            <div className="px-0.5 justify-center items-center flex">
              <div className="text-[#344054] text-base font-semibold font-['Inter'] leading-normal">
                Cancel
              </div>
            </div>
          </div>
          <div
            className="grow shrink basis-0 h-11 px-4 py-2.5 bg-[#4e6bd7] rounded-lg shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border-2 border-white justify-center items-center gap-1.5 flex overflow-hidden cursor-pointer"
            onClick={handleSubmit}
          >
            <div className="px-0.5 justify-center items-center flex">
              <div className="text-white text-base font-semibold font-['Inter'] leading-normal">
                Confirm
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
