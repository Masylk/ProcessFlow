import React from 'react';

interface PathCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PathCreationModal: React.FC<PathCreationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="w-[1440px] h-[960px] p-8 flex-col justify-center items-center inline-flex overflow-hidden">
        {/* Background overlay */}
        <div className="w-[1440px] h-[960px] justify-center items-center inline-flex">
          <div className="w-[1440px] h-[960px] relative opacity-70 bg-[#0c111d]/70" />
        </div>
        {/* Modal content */}
        <div className="h-[566px] bg-white rounded-xl shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)] flex-col justify-start items-center flex overflow-hidden">
          {/* Circular graphics */}
          <div className="w-[336px] h-[336px] relative">
            <div className="w-[336px] h-[336px] left-0 top-0 absolute justify-center items-center inline-flex">
              <div className="w-[336px] h-[336px] relative bg-black" />
            </div>
            <div className="w-[336px] h-[336px] left-0 top-0 absolute">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-[${24 * (index + 1)}px] h-[${
                    24 * (index + 1)
                  }px] left-[${(336 - 24 * (index + 1)) / 2}px] top-[${
                    (336 - 24 * (index + 1)) / 2
                  }px] absolute rounded-full border border-[#e4e7ec]`}
                />
              ))}
            </div>
          </div>
          {/* Title and description */}
          <div className="self-stretch h-40 flex-col justify-start items-center flex">
            <div className="self-stretch h-[140px] px-6 pt-6 flex-col justify-start items-start gap-4 flex">
              <div className="w-12 h-12 p-3 bg-white rounded-[10px]  border border-[#e4e7ec] justify-center items-center inline-flex overflow-hidden">
                <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden" />
              </div>
              <div className="self-stretch h-[52px] flex-col justify-start items-start gap-1 flex">
                <div className="self-stretch text-[#101828] text-lg font-semibold font-['Inter'] leading-7">
                  Double branch
                </div>
                <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                  Name your branches
                </div>
              </div>
            </div>
          </div>
          {/* Branch inputs */}
          <div className="self-stretch h-[306px] px-6 flex-col justify-start items-start gap-5 flex">
            <div className="self-stretch justify-start items-start gap-3 inline-flex">
              {['Branch n°1', 'Branch n°2'].map((branch, index) => (
                <div
                  key={index}
                  className="grow shrink basis-0 flex-col justify-start items-start gap-1.5 inline-flex"
                >
                  <div className="self-stretch h-[66px] flex-col justify-start items-start gap-1.5 flex">
                    <div className="justify-start items-start gap-0.5 inline-flex">
                      <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                        {branch}
                      </div>
                    </div>
                    <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start items-center gap-2 inline-flex">
                      <div className="grow shrink basis-0 h-6 justify-start items-center gap-2 flex">
                        <div className="grow shrink basis-0 text-[#667085] text-base font-normal font-['Inter'] leading-normal">
                          {index === 0 ? 'If' : 'Else'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="self-stretch h-[100px] pt-8 flex-col justify-start items-start flex">
            <div className="self-stretch px-6 pb-6 justify-start items-start gap-3 inline-flex">
              <button
                className="grow shrink basis-0 h-11 px-4 py-2.5 bg-white rounded-lg  border border-[#d0d5dd] justify-center items-center gap-1.5 flex overflow-hidden"
                onClick={onClose}
              >
                <span className="text-[#344054] text-base font-semibold font-['Inter'] leading-normal">
                  Cancel
                </span>
              </button>
              <button
                className="grow shrink basis-0 h-11 px-4 py-2.5 bg-[#4e6bd7] rounded-lg border-2 border-white justify-center items-center gap-1.5 flex overflow-hidden"
                onClick={onConfirm}
              >
                <span className="text-white text-base font-semibold font-['Inter'] leading-normal">
                  Confirm
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathCreationModal;
