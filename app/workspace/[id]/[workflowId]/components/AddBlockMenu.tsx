import React, { useState } from 'react';
import DelayDropdownMenu from './DelayDropdownMenu'; // Assuming you have this component
import PathDropdownPreview from './PathDropdownPreview'; // Assuming you have this component
import { BlockType } from '@/types/block';

interface AddBlockMenuProps {
  addStepBlock: () => Promise<void>;
  onAddBlockClick: (type: BlockType) => void;
}

const AddBlockMenu: React.FC<AddBlockMenuProps> = ({
  addStepBlock,
  onAddBlockClick,
}) => {
  const [isHoveringDelay, setIsHoveringDelay] = useState(false);
  const [isHoveringCondition, setIsHoveringCondition] = useState(false);
  const [isHoveringDelayMenu, setIsHoveringDelayMenu] = useState(false); // Hover state for DelayDropdownMenu
  const [isHoveringPreview, setIsHoveringPreview] = useState(false); // Hover state for PathDropdownPreview

  const showDelayDropdown = isHoveringDelay || isHoveringDelayMenu;
  const showPathPreview = isHoveringCondition || isHoveringPreview;

  const onClickConditional = () => {
    onAddBlockClick(BlockType.PATH);
  };

  const onClickCustomDelay = () => {
    onAddBlockClick(BlockType.DELAY);
  };

  return (
    <>
      <div className="h-[168px] bg-white rounded-lg shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08)] border border-[#e4e7ec] flex-col justify-start items-start inline-flex overflow-hidden z-50">
        <div className="w-60 px-1.5 py-px justify-start items-center inline-flex">
          <div className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden">
            <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
              <div className="grow shrink basis-0 text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
                Add a:
              </div>
            </div>
          </div>
        </div>
        <div className="w-full py-1 flex-col justify-start items-start flex overflow-hidden">
          {/* Step */}
          <div className="self-stretch px-1.5 py-px justify-start items-center inline-flex group">
            <div
              className="grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden group-hover:bg-[#edf0fb]"
              onClick={addStepBlock}
            >
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src="/assets/workflow/addstep-icon.svg"
                    alt="Step Icon"
                    className="group-hover:stroke-[#4761c4] transition-colors duration-200"
                  />
                </div>
                <div className="grow shrink basis-0 text-[#344054] text-sm font-semibold font-['Inter'] leading-tight group-hover:text-[#4761c4]">
                  Step
                </div>
              </div>
            </div>
          </div>
          {/* Conditional */}
          <div
            className="self-stretch px-1.5 py-px justify-start items-center inline-flex group relative"
            onMouseEnter={() => setIsHoveringCondition(true)}
            onMouseLeave={() => setIsHoveringCondition(false)}
            onClick={onClickConditional}
          >
            <div
              className={`grow shrink basis-0 h-[38px] px-2.5 py-[9px] justify-start items-center gap-3 flex overflow-hidden rounded-md ${
                showPathPreview ? 'bg-[#edf0fb] text-[#4761c4]' : ''
              }`}
            >
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src="/assets/workflow/addbranch-icon.svg"
                    alt="Conditional Icon"
                    className="transition-colors duration-200"
                  />
                </div>
                <div className="grow shrink basis-0 text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                  Conditional
                </div>
                <div
                  className={`w-4 h-4 relative overflow-hidden ${
                    showPathPreview ? 'block' : 'hidden'
                  }`}
                >
                  <img
                    src="/assets/shared_components/chevron-right.svg"
                    alt="Chevron Right Icon"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Delay */}
          <div
            className="self-stretch px-1.5 py-px justify-start items-center inline-flex group relative"
            onMouseEnter={() => setIsHoveringDelay(true)}
            onMouseLeave={() => setIsHoveringDelay(false)}
          >
            <div
              className={`grow shrink basis-0 h-[38px] px-2.5 py-[9px] rounded-md justify-start items-center gap-3 flex overflow-hidden ${
                showDelayDropdown ? 'bg-[#edf0fb] text-[#4761c4]' : ''
              }`}
            >
              <div className="grow shrink basis-0 h-5 justify-start items-center gap-2 flex">
                <div className="w-4 h-4 relative overflow-hidden">
                  <img
                    src="/assets/workflow/adddelay-icon.svg"
                    alt="Delay Icon"
                    className="transition-colors duration-200"
                  />
                </div>
                <div className="grow shrink basis-0 text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                  Delay
                </div>
                <div
                  className={`w-4 h-4 relative overflow-hidden ${
                    showDelayDropdown ? 'block' : 'hidden'
                  }`}
                >
                  <img
                    src="/assets/shared_components/chevron-right.svg"
                    alt="Chevron Right Icon"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showPathPreview && (
        <div
          className="relative h-full translate-x-[99.8%] translate-y-[-83.5%] ml-2 z-50"
          onMouseEnter={() => setIsHoveringPreview(true)}
          onMouseLeave={() => setIsHoveringPreview(false)}
        >
          <PathDropdownPreview />
        </div>
      )}
      {showDelayDropdown && (
        <div
          className="relative h-full translate-x-[96.5%] translate-y-[-25.5%] ml-2 z-50"
          onMouseEnter={() => setIsHoveringDelayMenu(true)}
          onMouseLeave={() => setIsHoveringDelayMenu(false)}
        >
          <DelayDropdownMenu onClickCustomDelay={onClickCustomDelay} />
        </div>
      )}
    </>
  );
};

export default AddBlockMenu;
