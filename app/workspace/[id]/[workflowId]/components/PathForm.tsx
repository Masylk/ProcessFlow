import React, { useState, ChangeEvent, useEffect } from 'react';

interface PathFormProps {
  onSubmit: (blockData: any, pathId: number, position: number) => void;
  onCancel: () => void;
  initialPosition: number;
  workflowId: number;
  pathId: number;
  position: number;
}

const PathForm: React.FC<PathFormProps> = ({
  onSubmit,
  onCancel,
  initialPosition,
  workflowId,
  pathId,
  position,
}) => {
  const [formData, setFormData] = useState({
    type: 'PATH',
    description: '',
    position: initialPosition,
    workflowId: workflowId,
    pathOptions: ['If', 'Else'], // Always two options: "if" and "else"
  });

  const handleInputChange = (index: number, value: string) => {
    const updatedInputs = [...formData.pathOptions];
    updatedInputs[index] = value;
    setFormData((prevFormData) => ({
      ...prevFormData, // Spread the previous form data
      pathOptions: updatedInputs, // Update `pathOptions` with the new inputs
    }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePathOptionChange = (index: number, value: string) => {
    const newPathOptions = [...formData.pathOptions];
    newPathOptions[index] = value;
    setFormData((prev) => ({ ...prev, pathOptions: newPathOptions }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit(
      {
        ...formData,
        pathBlock: {
          pathOptions: formData.pathOptions
            .reverse()
            .filter((option) => option.trim() !== '')
            .map((option) => ({ pathOption: option })),
        },
      },
      pathId,
      position
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div className="w-[512px] h-[566px] bg-white rounded-xl shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08)] flex-col justify-start items-center inline-flex overflow-hidden">
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
              Double branch
            </div>
            <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight z-10">
              Name your branches
            </div>
          </div>
        </div>
        <div className="self-stretch h-5" />
      </div>
      <div className="self-stretch h-[306px] px-6 flex-col justify-start items-start gap-5   flex z-10">
        <div
          className="pl-[102px] pr-[101px] pt-0 pb-[0] bg-gray-50 rounded-lg justify-center items-center inline-flex overflow-hidden"
          style={{
            width: '460px',
            height: '306px',
            backgroundImage: 'url(/assets/workflow/pathform-preview.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        ></div>

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
                <div className="self-stretch px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] justify-start w-[220px] items-center gap-2 inline-flex">
                  <input
                    type="text"
                    value={formData.pathOptions[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="grow shrink basis-0 h-6 text-[#667085] w-2 text-base font-normal font-['Inter'] leading-normal border-none outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
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
};

export default PathForm;
