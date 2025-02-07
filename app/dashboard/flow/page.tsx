"use client"
import { useState } from "react";

export default function Home() {
  const [flowName, setFlowName] = useState("");
  const [flowDescription, setFlowDescription] = useState("");

  return (
    <div className="w-[1440px] h-[960px] p-8 flex-col justify-center items-center inline-flex overflow-hidden">
      <div className="bg-white w-[550px] rounded-xl shadow-[0px_8px_8px_-4px_rgba(16,24,40,0.03)] shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08)] flex-col justify-start items-start flex overflow-hidden">
        <div className="flex items-start gap-4 px-6 pt-6 flex-col">
          <div className="w-12 h-12 p-3 bg-white rounded-[10px] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] border border-[#e4e7ec] justify-center items-center inline-flex overflow-hidden">
            <div className="w-6 h-6 relative flex-col justify-start items-start flex overflow-hidden">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}${process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PATH}/assets/shared_components/layers-three-01.svg`}
                alt="3 layers icon"
                className="w-6 h-6"
              />
            </div>
          </div>
          <div className="flex-col justify-start items-start gap-1 flex">
            <div className="text-[#101828] text-lg font-semibold font-['Inter'] leading-7">Create a new Flow</div>
            <div className="text-[#475467] text-sm font-normal font-['Inter'] leading-tight">Start from scratch or start with one of our templates.</div>
          </div>
        </div>
        <div className="self-stretch  px-6 pt-4 pb-4 border-b border-[#e4e7ec] flex-col justify-start items-start gap-3 flex">
          <div className="self-stretch h-[178px] flex-col justify-start items-start gap-3 flex">
            <div className="self-stretch h-[70px] flex-col justify-start items-start gap-1.5 flex">
              <label className="text-[#344054] text-sm font-semibold">Flow name *</label>
              <input 
                type="text" 
                className="self-stretch px-3.5 py-2.5 bg-white rounded-lg border border-[#d0d5dd] text-base text-[#667085]" 
                placeholder="e.g Create a new task"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
              />
            </div>
            <div className="self-stretch h-24 flex-col justify-start items-start gap-1.5 flex">
              <label className="text-[#344054] text-sm font-semibold">Flow description</label>
              <textarea 
                className="self-stretch px-3.5 py-3 bg-white rounded-lg border border-[#d0d5dd] text-base text-[#667085] overflow-y-auto resize-none"
                placeholder="This Flow indicates the user how to create a task"
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#d0d5dd transparent' }}
              />
            </div>
          </div>
        </div>
        <div className="self-stretch h-[300px] p-6 flex-col justify-start items-start gap-5 flex overflow-hidden">
          <div className="text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">New</div>
          <div className="self-stretch p-4 bg-white rounded-xl border-2 border-[#4e6bd7] justify-start items-start gap-1 inline-flex">
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
                  <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">New Flow</div>
                </div>
                <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">Build your flow from scratch.</div>
              </div>
            </div>
            <div className="w-4 h-4 p-[5px] bg-[#4761c4] rounded-full justify-center items-center flex overflow-hidden">
              <div className="w-1.5 h-1.5 relative bg-white rounded-full" />
            </div>
          </div>
          <div className="opacity-50 h-[296px] relative w-full">
            <div className="left-0 top-0 text-[#344054] text-sm font-semibold font-['Inter'] leading-tight">Templates (coming soon...)</div>
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
                    <div className="text-[#344054] text-sm font-medium font-['Inter'] leading-tight">Onboarding</div>
                  </div>
                  <div className="self-stretch text-[#475467] text-sm font-normal font-['Inter'] leading-tight">Placeholder explaining the flow</div>
                </div>
              </div>
              <div className="w-4 h-4 relative rounded-full border border-[#d0d5dd]" />
            </div>
          </div>
        </div>
        <div className="self-stretch h-[92px] pt-6 border-t border-[#e4e7ec] flex-col justify-start items-start flex">
          <div className="self-stretch px-6 pb-6 justify-start items-start gap-3 inline-flex">
            {/* Cancel Button */}
              <div className="grow shrink basis-0 h-11 px-4 py-2.5 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] 
                  shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] 
                  border border-[#d0d5dd] justify-center items-center gap-1.5 flex overflow-hidden 
                  transition-all duration-300 hover:bg-[#F9FAFB] cursor-pointer">
                  <div className="px-0.5 justify-center items-center flex">
                      <div className="text-[#344054] text-base font-semibold font-['Inter'] leading-normal">Cancel</div>
                  </div>
              </div>
            {/* Create Flow Button */}
              <div className="grow shrink basis-0 h-11 px-4 py-2.5 bg-[#4e6bd7] rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05) cursor-hand] 
                  shadow-[inset_0px_-2px_0px_0px_rgba(16,24,40,0.05)] shadow-[inset_0px_0px_0px_1px_rgba(16,24,40,0.18)] 
                  border-2 border-white justify-center items-center gap-1.5 flex overflow-hidden 
                  transition-all duration-300 hover:bg-[#374C99] cursor-pointer">
                  <div className="px-0.5 justify-center items-center flex">
                      <div className="text-white text-base font-semibold font-['Inter'] leading-normal">Create Flow</div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}