'use client';
import { Workflow } from '@/types/workflow';
import { Folder } from '@/types/workspace';
import { useState } from 'react';

interface EditFlowModalProps {
  onClose: () => void;
  onConfirm: (
    id: number,
    name: string,
    description: string,
    folder: Folder | null | undefined
  ) => Promise<Workflow | null>;
  selectedWorkflow: Workflow;
}

export default function EditFlowModal({
  onClose,
  onConfirm,
  selectedWorkflow,
}: EditFlowModalProps) {
  const [processName, setProcessName] = useState(selectedWorkflow.name);
  const [flowDescription, setFlowDescription] = useState(
    selectedWorkflow.description
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 w-full">
      <div className="w-full h-full absolute opacity-40 bg-[#0c111d]" />
      <div className="h-[446px] bg-white rounded-xl shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03),0px_20px_24px_-4px_rgba(16,24,40,0.08)] flex-col justify-start items-center flex overflow-hidden relative z-10">
        <div className="w-[550px] h-[336px] relative" />
        <div className="self-stretch h-40 flex-col justify-start items-center flex">
          <div className="self-stretch h-[140px] px-6 pt-6 flex-col justify-start items-start gap-4 flex">
            <div className="w-12 h-12 p-3 bg-white rounded-[10px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#e4e7ec] justify-center items-center inline-flex overflow-hidden">
              <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-three-01.svg`}
                  alt="Flow icon"
                  className="w-6 h-6"
                />
              </div>
            </div>
            <div className="self-stretch h-[52px] flex-col justify-start items-start gap-1 flex">
              <div className="self-stretch text-[#101828] text-lg font-semibold font-['Inter'] leading-7">
                Edit a Flow
              </div>
              <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">
                Edit your Flow's name
              </div>
            </div>
          </div>
          <div className="self-stretch h-5" />
        </div>
        <div className="self-stretch h-[186px] px-6 flex-col justify-start items-start gap-5 flex">
          <div className="self-stretch h-[70px] flex-col justify-start items-start gap-3 flex">
            <div className="justify-start items-start gap-0.5 inline-flex">
              <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
                Process name
              </div>
              <div className="text-[#4761c4] text-sm font-medium font-['Inter'] leading-tight">
                *
              </div>
            </div>
            <input
              className="self-stretch px-3.5 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] border border-[#d0d5dd] text-[#101828] placeholder-[#667085]"
              placeholder="Onboarding Process"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
            />
          </div>
          <div className="self-stretch h-24 flex-col justify-start items-start gap-1.5 flex">
            <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">
              Flow description
            </div>
            <textarea
              className="self-stretch px-3.5 py-3 bg-white rounded-lg border border-[#d0d5dd] text-[#101828] placeholder-[#667085] overflow-y-auto resize-none"
              placeholder="This Flow defines how to onboard a new employee"
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d0d5dd transparent',
              }}
            />
          </div>
        </div>
        <div className="self-stretch h-[100px] pt-8 flex-col justify-start items-start flex">
          <div className="self-stretch px-6 pb-6 justify-start items-start gap-3 inline-flex">
            <button
              onClick={() => onClose()}
              className="grow shrink basis-0 h-11 px-4 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-[#344054] text-base font-semibold transition duration-300 hover:bg-[#F9FAFB]"
            >
              Discard changes
            </button>
            <button
              onClick={async () => {
                await onConfirm(
                  selectedWorkflow.id,
                  processName,
                  flowDescription,
                  undefined
                );
                onClose();
              }}
              className="grow shrink basis-0 h-11 px-4 py-2.5 bg-[#4e6bd7] rounded-lg border-2 border-white text-white text-base font-semibold transition duration-300 hover:bg-[#374C99]"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
