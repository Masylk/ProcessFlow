import React from 'react';
import { Block } from '@/types/block';

interface BlockInformationsProps {
  block: Block;
}

export default function BlockInformations({ block }: BlockInformationsProps) {
  return (
    <div className="border-t border-b border-[#e4e7ec] my-4 py-4">
      <div className="h-36 justify-start items-start gap-6 inline-flex">
        <div className="self-stretch flex-col justify-between items-start inline-flex">
          <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
            Assignee
          </div>
          <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
            Last Modified
          </div>
          <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
            Average time
          </div>
          <div className="text-[#344054] text-sm font-normal font-['Inter'] leading-tight">
            Type
          </div>
        </div>
        <div className="h-36 flex-col justify-between items-start inline-flex">
          <div className="h-[18px] justify-start items-center gap-2 inline-flex">
            <div className="px-1.5 py-0.5 bg-[#eef3ff] rounded-md border-[#c6d7fe] justify-start items-center flex">
              <div className="text-center text-[#3537cc] text-xs font-medium font-['Inter'] leading-[18px]">
                Human Resources
              </div>
            </div>
          </div>
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              17/08/2024
            </div>
          </div>
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              10min
            </div>
          </div>
          <div className="justify-start items-center gap-2 inline-flex">
            <div className="text-center text-[#667085] text-xs font-normal font-['Inter'] leading-[18px]">
              Manual
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
