'use client';
import { useState } from 'react';
import ButtonNormal from '../../components/ButtonNormal';
import InputField from '../../components/InputFields';
import TextAreaInput from '../../components/TextAreaInput';

interface CreateFlowModalProps {
  onClose: () => void;
  onCreateFlow: (name: string, description: string) => Promise<void>;
  mode?: 'light' | 'dark';
}

export default function CreateFlowModal({
  onClose,
  onCreateFlow,
  mode = 'light'
}: CreateFlowModalProps) {
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-8 ${
        mode === 'dark' ? 'bg-[#0c111d] bg-opacity-40' : 'bg-black bg-opacity-40'
      }`}
      onClick={onClose}
    >
      <div 
        onClick={handleModalClick}
        className={`w-[550px] rounded-xl shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)] flex-col justify-start items-start flex overflow-hidden ${
          mode === 'dark' ? 'bg-darkMode-bg-primary' : 'bg-white'
        }`}
      >
        <div className="flex items-start gap-4 px-6 pt-6 flex-col">
          <div className={`w-12 h-12 p-3 rounded-[10px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border justify-center items-center inline-flex overflow-hidden ${
            mode === 'dark' ? 'bg-darkMode-bg-secondary border-darkMode-border-primary' : 'bg-white border-[#e4e7ec]'
          }`}>
            <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-three-01.svg`}
                alt="3 layers icon"
                className="w-6 h-6"
              />
            </div>
          </div>
          <div className="flex-col justify-start items-start gap-1 flex">
            <div className={`text-lg font-semibold font-['Inter'] leading-7 ${
              mode === 'dark' ? 'text-darkMode-text-primary' : 'text-[#101828]'
            }`}>
              Create a new Flow
            </div>
            <div className={`text-sm font-normal font-['Inter'] leading-tight ${
              mode === 'dark' ? 'text-darkMode-text-secondary' : 'text-[#475467]'
            }`}>
              Start from scratch or start with one of our templates.
            </div>
          </div>
        </div>
        <div className={`self-stretch px-6 pt-4 pb-4 border-b flex-col justify-start items-start gap-3 flex ${
          mode === 'dark' ? 'border-darkMode-border-primary' : 'border-[#e4e7ec]'
        }`}>
          <div className="self-stretch flex-col justify-start items-start gap-3 flex">
            <InputField
              label="Flow name"
              required
              value={flowName}
              onChange={(value) => setFlowName(value)}
              placeholder="e.g Create a new task"
              mode={mode}
            />
            <TextAreaInput
              label="Flow description"
              value={flowDescription}
              onChange={(value) => setFlowDescription(value)}
              placeholder="This Flow indicates the user how to create a task"
              mode={mode}
            />
          </div>
        </div>
        <div className="self-stretch h-[300px] p-6 flex-col justify-start items-start gap-5 flex overflow-hidden">
          <div className={`text-sm font-semibold font-['Inter'] leading-tight ${
            mode === 'dark' ? 'text-darkMode-text-primary' : 'text-[#344054]'
          }`}>
            New
          </div>
          <div className={`self-stretch p-4 rounded-xl border-2 justify-start items-start gap-1 inline-flex ${
            mode === 'dark' ? 'bg-darkMode-bg-primary border-[#4e6bd7]' : 'bg-white border-[#4e6bd7]'
          }`}>
            <div className="grow shrink basis-0 h-10 justify-start items-start gap-3 flex">
              <div className="w-8 h-8 p-2 bg-[#c8d1f3] rounded-full justify-center items-center flex overflow-hidden">
                <div className="w-4 h-4 relative flex-col justify-start items-start flex overflow-hidden">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-two-blue.svg`}
                    alt="2 layers blue icon"
                    className="w-4 h-4"
                  />
                </div>
              </div>
              <div className="grow shrink basis-0 flex-col justify-start items-start inline-flex">
                <div className="justify-start items-start gap-1 inline-flex">
                  <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                    New Flow
                  </div>
                </div>
                <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                  Build your flow from scratch.
                </div>
              </div>
            </div>
            <div className="w-4 h-4 p-[5px] bg-[#4761c4] rounded-full justify-center items-center flex overflow-hidden">
              <div className="w-1.5 h-1.5 relative bg-white rounded-full" />
            </div>
          </div>
          <div className="opacity-50 h-[296px] relative w-full">
            <div className="left-0 top-0 text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
              Templates (coming soon...)
            </div>
            <div className="w-full h-[72px] p-4 left-0 top-[40px] absolute bg-white rounded-xl border border-[#e4e7ec] justify-start items-start gap-1 inline-flex">
              <div className="grow shrink basis-0 h-10 justify-start items-start gap-3 flex">
                <div className="w-8 h-8 p-2 bg-[#DCFAE6] rounded-full justify-center items-center flex overflow-hidden">
                  <div className="w-4 h-4 relative flex-col justify-start items-start flex overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-two-green.svg`}
                      alt="2 layers green icon"
                      className="w-4 h-4"
                    />
                  </div>
                </div>
                <div className="grow shrink basis-0 flex-col justify-start items-start inline-flex">
                  <div className="justify-start items-start gap-1 inline-flex">
                    <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">
                      Onboarding
                    </div>
                  </div>
                  <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                    Placeholder explaining the flow
                  </div>
                </div>
              </div>
              <div className="w-4 h-4 relative rounded-full border border-[#d0d5dd]" />
            </div>
          </div>
        </div>
        <div className={`self-stretch  py-6 border-t flex-col justify-start items-start flex ${
          mode === 'dark' ? 'border-darkMode-border-primary' : 'border-[#e4e7ec]'
        }`}>
          <div className="self-stretch px-6 justify-start items-start gap-3 inline-flex">
            <ButtonNormal
              onClick={onClose}
              variant="secondaryGray"
              mode={mode}
              size="small"
              className='grow shrink basis-0'
            >
              Cancel
            </ButtonNormal>
            <ButtonNormal 
              onClick={() => {
                onCreateFlow(flowName, flowDescription);
                onClose();
              }}
              variant="primary"
              mode={mode}
              size="small"
              className='grow shrink basis-0'
            >
              Create Flow
            </ButtonNormal>
          </div>
        </div>
      </div>
    </div>
  );
}
