import React from 'react';

interface SidebarProps {
  stepCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ stepCount }) => {
  return (
    <div className="w-[292px] bg-white border-r border-[#e4e7ec] justify-start items-start inline-flex overflow-hidden">
      <div className="flex-col justify-start items-start gap-6 inline-flex">
        {/* Header Block */}
        <div className="h-[72px] flex-col justify-center items-start gap-6 inline-flex">
          <div className="self-stretch h-8 pl-6 pr-5 flex-col justify-start items-start flex">
            <div className="w-[142px] justify-start items-start inline-flex">
              <div className="justify-end font-['Inter'] items-center text-xl font-bold gap-3 flex">
                <div className="shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] justify-start items-start inline-flex">
                  <div className="w-8 h-8 relative bg-gradient-to-bl from-[#4d6de3] to-[#1b2860] rounded-lg shadow-[inset_0px_0px_0px_0.6666666865348816px_rgba(16,24,40,0.24)] overflow-hidden">
                    <img
                      src="https://grzxiilmiwwwepaymqnu.supabase.co/storage/v1/object/public/public-assets/assets/shared_components/processflow_logo.png"
                      alt="Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                Processflow
              </div>
            </div>
          </div>
        </div>

        {/* New Block Below */}
        <div className="h-[227px] p-6 flex-col justify-start items-center gap-2 inline-flex">
          <div className="w-[199px] h-[31px] text-black text-sm font-semibold font-['Inter'] leading-tight">
            {stepCount} Steps
          </div>
          <div className="self-stretch h-[140px] flex-col justify-start items-start gap-1 flex">
            <div className="px-3 py-1.5 bg-[#4761c4] rounded-lg justify-center items-center gap-2 inline-flex">
              <div className="text-white text-sm font-bold font-['Inter'] leading-tight">
                1.
              </div>
              <div className="justify-start items-center gap-1 flex">
                <div className="w-4 h-4 px-[1.33px] py-[3.33px] justify-center items-center flex overflow-hidden" />
                <div className="w-[181px] text-white text-sm font-medium font-['Inter'] leading-tight">
                  Read the introduction...
                </div>
              </div>
            </div>
            <div className="self-stretch px-3 py-1.5 rounded justify-center items-center gap-2 inline-flex">
              <div className="text-[#101828] text-sm font-bold font-['Inter'] leading-tight">
                2.
              </div>
              <div className="justify-start items-center gap-1 flex">
                <div className="w-4 h-4 relative shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]  overflow-hidden">
                  <div className="w-[11px] h-[8.50px] left-[2.50px] top-[3.50px] absolute"></div>
                </div>
                <div className="w-[181px] text-[#667085] text-sm font-medium font-['Inter'] leading-tight">
                  Send your presentation...
                </div>
              </div>
            </div>
            <div className="self-stretch px-3 py-1.5 rounded justify-center items-center gap-2 inline-flex">
              <div className="text-[#101828] text-sm font-bold font-['Inter'] leading-tight">
                3.
              </div>
              <div className="justify-start items-center gap-1 flex">
                <div className="w-4 h-4 pl-[2.67px] pr-0.5 py-[1.33px] justify-center items-center flex overflow-hidden" />
                <div className="w-[181px] text-[#667085] text-sm font-medium font-['Inter'] leading-tight">
                  Get through all the docs..
                </div>
              </div>
            </div>
            <div className="self-stretch px-3 py-1.5 rounded justify-center items-center gap-2 inline-flex">
              <div className="text-[#101828] text-sm font-bold font-['Inter'] leading-tight">
                4.
              </div>
              <div className="grow shrink basis-0 h-5 justify-between items-center flex">
                <div className="justify-start items-center gap-1 flex">
                  <div className="w-4 h-4 relative  overflow-hidden" />
                  <div className="text-[#667085] text-sm font-medium font-['Inter'] leading-tight">
                    Access the Linear
                  </div>
                </div>
                <div className="w-3 h-3 py-[3px] justify-center items-center flex overflow-hidden" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
