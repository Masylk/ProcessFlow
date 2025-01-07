import { BlockType } from '@/types/block';
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
  const [days, setDays] = useState<number>(0);
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);

  // Increment function with optional max constraint
  const increment = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    max: number | null = null
  ): void => {
    setter((prev) => (max !== null && prev >= max ? prev : prev + value));
  };

  // Decrement function with optional min constraint
  const decrement = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    value: number,
    min: number = 0
  ): void => {
    setter((prev) => (prev <= min ? prev : prev - value));
  };

  const delayText = (days: number, hours: number, minutes: number) => {
    if (days === 0 && hours === 0 && minutes === 0) {
      return 'No delay';
    }
    return `Delay of ${days} ${days === 1 ? 'day' : 'days'}, ${hours} ${
      hours === 1 ? 'hour' : 'hours'
    }, and ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`;
  };

  const calculateDelay = () => days * 86400 + hours * 3600 + minutes * 60;

  const handleSubmit = (e: React.FormEvent) => {
    console.log('adding a custom delay of : ' + calculateDelay());
    e.preventDefault();
    onSubmit(
      {
        type: BlockType.STEP, // Specify the type as STEP
        title: '', // Title is required, so set it to an empty string
        description: '', // Optional, leave as an empty string
        delay: calculateDelay(),
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
          <div className="w-7 h-7 relative flex-col justify-start items-start flex overflow-hidden">
            <img
              src="/assets/shared_components/clock-stopwatch.svg"
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
          {/* Day Counter */}
          <div className="grow shrink basis-0 flex-col w-36 justify-start items-start gap-1.5 inline-flex">
            <div className="self-stretch h-[62px] flex-col justify-start items-start gap-1.5 flex z-50">
              <div className="justify-start items-start gap-0.5 inline-flex">
                <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Days
                </div>
              </div>
              <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex overflow-hidden">
                <div className="justify-start items-center gap-2 flex">
                  <div
                    className={`w-[110px] text-base font-normal font-['Inter'] leading-normal ${
                      days === 0 ? 'text-[#667085]' : 'text-[#101828]'
                    }`}
                  >
                    {days}
                  </div>
                  <div className="shadow-[inset_0px_0px_0px_0.5000000596046448px_rgba(16,24,40,0.18)] border-l border-[#d0d5dd] flex-col justify-start items-start inline-flex overflow-hidden">
                    <button
                      onClick={() => increment(setDays, 1)}
                      className="px-1.5 py-1 bg-white border-t border-[#d0d5dd]"
                    >
                      <img
                        src="/assets/shared_components/chevron-up.svg"
                        alt="Increase Days"
                        className="w-2.5 h-2.5 object-contain"
                      />
                    </button>
                    <button
                      onClick={() => decrement(setDays, 1)}
                      className="px-1.5 py-1 bg-white border-t border-[#d0d5dd]"
                    >
                      <img
                        src="/assets/shared_components/chevron-down.svg"
                        alt="Decrease Days"
                        className="w-2.5 h-2.5 object-contain"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hour Counter */}
          <div className="grow shrink basis-0 flex-col w-36 justify-start items-start gap-1.5 inline-flex">
            <div className="self-stretch h-[62px] flex-col justify-start items-start gap-1.5 flex z-50">
              <div className="justify-start items-start gap-0.5 inline-flex">
                <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Hours
                </div>
              </div>
              <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex overflow-hidden">
                <div className="justify-start items-center gap-2 flex">
                  <div
                    className={`w-[110px] text-base font-normal font-['Inter'] leading-normal ${
                      hours === 0 ? 'text-[#667085]' : 'text-[#101828]'
                    }`}
                  >
                    {hours}
                  </div>
                  <div className="shadow-[inset_0px_0px_0px_0.5000000596046448px_rgba(16,24,40,0.18)] border-l border-[#d0d5dd] flex-col justify-start items-start inline-flex overflow-hidden">
                    <button
                      onClick={() => increment(setHours, 1, 23)}
                      className="px-1.5 py-1 bg-white border-t border-[#d0d5dd]"
                    >
                      <img
                        src="/assets/shared_components/chevron-up.svg"
                        alt="Increase Hours"
                        className="w-2.5 h-2.5 object-contain"
                      />
                    </button>
                    <button
                      onClick={() => decrement(setHours, 1)}
                      className="px-1.5 py-1 bg-white border-t border-[#d0d5dd]"
                    >
                      <img
                        src="/assets/shared_components/chevron-down.svg"
                        alt="Decrease Hours"
                        className="w-2.5 h-2.5 object-contain"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minute Counter */}
          <div className="grow shrink basis-0 flex-col w-36 justify-start items-start gap-1.5 inline-flex">
            <div className="self-stretch h-[62px] flex-col justify-start items-start gap-1.5 flex z-50">
              <div className="justify-start items-start gap-0.5 inline-flex">
                <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                  Minutes
                </div>
              </div>
              <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex overflow-hidden">
                <div className="justify-start items-center gap-2 flex">
                  <div
                    className={`w-[110px] text-base font-normal font-['Inter'] leading-normal ${
                      minutes === 0 ? 'text-[#667085]' : 'text-[#101828]'
                    }`}
                  >
                    {minutes}
                  </div>
                  <div className="shadow-[inset_0px_0px_0px_0.5000000596046448px_rgba(16,24,40,0.18)] border-l border-[#d0d5dd] flex-col justify-start items-start inline-flex">
                    <button
                      onClick={() => increment(setMinutes, 1, 59)}
                      className="px-1.5 py-1 bg-white border-t border-[#d0d5dd]"
                    >
                      <img
                        src="/assets/shared_components/chevron-up.svg"
                        alt="Increase Minutes"
                        className="w-2.5 h-2.5 object-contain"
                      />
                    </button>
                    <button
                      onClick={() => decrement(setMinutes, 1)}
                      className="px-1.5 py-1 bg-white border-t border-[#d0d5dd]"
                    >
                      <img
                        src="/assets/shared_components/chevron-down.svg"
                        alt="Decrease Minutes"
                        className="w-2.5 h-2.5 object-contain"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="self-stretch px-3 py-2 bg-white rounded-xl border border-[#d0d5dd] justify-start items-start gap-4 inline-flex overflow-hidden">
          <div className="grow shrink basis-0 h-[22px] pr-2 justify-start items-center gap-2 flex">
            <div className="w-5 h-5 rounded-full justify-center items-center flex">
              <img
                src="/assets/shared_components/alert-circle.svg"
                alt="Close Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="grow shrink basis-0 pt-0.5 flex-col justify-start items-start gap-3 inline-flex">
              <div className="self-stretch h-5 flex-col justify-start items-start gap-1 flex">
                <div className="self-stretch text-[#101828] text-sm font-semibold font-['Inter'] leading-tight">
                  {delayText(days, hours, minutes)}
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
